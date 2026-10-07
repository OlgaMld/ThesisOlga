import path from "path";
import { pool } from "../config/db.js";

export async function uploadCv(req, res) {
  const { title, public: isPublic } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Το αρχείο PDF είναι υποχρεωτικό." });
  }

  if (!title) {
    return res.status(400).json({ message: "Ο τίτλος βιογραφικού είναι υποχρεωτικός." });
  }

  const relativePath = path.join("uploads", req.file.filename).replace(/\\/g, "/");
  const [result] = await pool.query(
    "INSERT INTO cv (id_user, title, cv_file, public) VALUES (?, ?, ?, ?)",
    [req.user.id, title, relativePath, isPublic ? 1 : 0]
  );

  return res.status(201).json({
    id: result.insertId,
    id_user: req.user.id,
    title,
    cv_file: relativePath,
    public: isPublic ? 1 : 0
  });
}

export async function listMyCvs(req, res) {
  const [rows] = await pool.query(
    "SELECT * FROM cv WHERE id_user = ? ORDER BY date_upload DESC, id DESC",
    [req.user.id]
  );

  return res.json(rows);
}

