import { pool } from "../config/db.js";

export async function listPublicJobs(_req, res) {
  const [rows] = await pool.query(
    `SELECT aggelies.*, admin.fullname AS admin_name
     FROM aggelies
     JOIN admin ON admin.id = aggelies.id_admin
     WHERE aggelies.public = 1
     ORDER BY aggelies.id DESC`
  );
  return res.json(rows);
}

export async function createJob(req, res) {
  const { title, description, public: isPublic } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Ο τίτλος και η περιγραφή είναι υποχρεωτικά." });
  }

  const [result] = await pool.query(
    "INSERT INTO aggelies (id_admin, title, description, public) VALUES (?, ?, ?, ?)",
    [req.user.id, title, description, isPublic ? 1 : 0]
  );

  return res.status(201).json({
    id: result.insertId,
    id_admin: req.user.id,
    title,
    description,
    public: isPublic ? 1 : 0
  });
}

export async function listAdminJobs(req, res) {
  const [rows] = await pool.query(
    `SELECT a.*,
      COUNT(cg.id_cv) AS applications
     FROM aggelies a
     LEFT JOIN cv_ggelies cg ON cg.id_agg = a.id
     WHERE a.id_admin = ?
     GROUP BY a.id
     ORDER BY a.id DESC`,
    [req.user.id]
  );

  return res.json(rows);
}

