import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

function buildToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export async function registerUser(req, res) {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({ message: "Συμπληρώστε όλα τα πεδία." });
  }

  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length) {
    return res.status(409).json({ message: "Το email χρησιμοποιείται ήδη." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    "INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)",
    [fullname, email, hashedPassword]
  );

  const user = { id: result.insertId, fullname, email, role: "candidate" };
  const token = buildToken(user);
  return res.status(201).json({ token, user });
}

export async function login(req, res) {
  const { email, password, role } = req.body;
  const table = role === "admin" ? "admin" : "users";

  const [rows] = await pool.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);
  const account = rows[0];

  if (!account) {
    return res.status(401).json({ message: "Λάθος στοιχεία σύνδεσης." });
  }

  const isHashed = typeof account.password === "string" && account.password.startsWith("$2");
  const isMatch = isHashed
    ? await bcrypt.compare(password, account.password)
    : password === account.password;
  if (!isMatch) {
    return res.status(401).json({ message: "Λάθος στοιχεία σύνδεσης." });
  }

  const user = {
    id: account.id,
    fullname: account.fullname,
    email: account.email,
    role: role === "admin" ? "admin" : "candidate"
  };
  const token = buildToken(user);
  return res.json({ token, user });
}

export async function me(req, res) {
  return res.json({ user: req.user });
}
