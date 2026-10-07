import path from "path";
import { pool } from "../config/db.js";
import { evaluateApplication } from "../services/llmService.js";

export async function applyToJob(req, res) {
  const { jobId, cvId } = req.body;

  if (!jobId || !cvId) {
    return res.status(400).json({ message: "Χρειάζονται αγγελία και βιογραφικό." });
  }

  const [cvRows] = await pool.query("SELECT * FROM cv WHERE id = ? AND id_user = ?", [cvId, req.user.id]);
  if (!cvRows.length) {
    return res.status(404).json({ message: "Το βιογραφικό δεν βρέθηκε." });
  }

  const [jobRows] = await pool.query("SELECT * FROM aggelies WHERE id = ? AND public = 1", [jobId]);
  if (!jobRows.length) {
    return res.status(404).json({ message: "Η αγγελία δεν βρέθηκε." });
  }

  await pool.query(
    `INSERT INTO cv_ggelies (id_cv, id_agg, api, response, grade)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE date = CURRENT_TIMESTAMP`,
    [cvId, jobId, null, null, null]
  );

  return res.status(201).json({ message: "Η αίτηση καταχωρήθηκε." });
}

export async function listMyApplications(req, res) {
  const [rows] = await pool.query(
    `SELECT
      cg.id_cv,
      cg.id_agg,
      cg.api,
      cg.response,
      cg.date,
      cg.grade,
      cv.title AS cv_title,
      cv.cv_file,
      a.title AS job_title,
      a.description AS job_description,
      admin.fullname AS admin_name
     FROM cv_ggelies cg
     JOIN cv ON cv.id = cg.id_cv
     JOIN aggelies a ON a.id = cg.id_agg
     JOIN admin ON admin.id = a.id_admin
     WHERE cv.id_user = ?
     ORDER BY cg.date DESC, cg.id_agg DESC`,
    [req.user.id]
  );

  return res.json(rows);
}

export async function evaluateJobApplications(req, res) {
  const { jobId } = req.params;
  const provider = req.body?.provider || "mock";

  const [jobRows] = await pool.query("SELECT * FROM aggelies WHERE id = ? AND id_admin = ?", [
    jobId,
    req.user.id
  ]);

  if (!jobRows.length) {
    return res.status(404).json({ message: "Η αγγελία δεν βρέθηκε." });
  }

  const job = jobRows[0];
  const [applications] = await pool.query(
    `SELECT cg.id_cv, cg.id_agg, cv.title AS cv_title, cv.cv_file, users.fullname, users.email
     FROM cv_ggelies cg
     JOIN cv ON cv.id = cg.id_cv
     JOIN users ON users.id = cv.id_user
     WHERE cg.id_agg = ?`,
    [jobId]
  );

  const evaluated = [];
  for (const application of applications) {
    const result = await evaluateApplication({
      jobTitle: job.title,
      jobDescription: job.description,
      cvFilePath: path.resolve(application.cv_file),
      provider: provider
    });

    await pool.query(
      `UPDATE cv_ggelies
       SET api = ?, response = ?, grade = ?, date = CURRENT_TIMESTAMP
       WHERE id_cv = ? AND id_agg = ?`,
      [provider, result.summary, result.score, application.id_cv, jobId]
    );

    evaluated.push({
      ...application,
      grade: result.score,
      response: result.summary
    });
  }

  return res.json({
    job: {
      id: job.id,
      title: job.title
    },
    applications: evaluated
  });
}

export async function listJobApplications(req, res) {
  const { jobId } = req.params;
  const [rows] = await pool.query(
    `SELECT cg.*, cv.title AS cv_title, cv.cv_file, users.fullname, users.email
     FROM cv_ggelies cg
     JOIN cv ON cv.id = cg.id_cv
     JOIN users ON users.id = cv.id_user
     JOIN aggelies a ON a.id = cg.id_agg
     WHERE cg.id_agg = ? AND a.id_admin = ?
     ORDER BY cg.grade DESC, cg.date DESC`,
    [jobId, req.user.id]
  );

  return res.json(rows);
}
