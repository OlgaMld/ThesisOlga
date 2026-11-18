import fs from "fs";
import multer from "multer";
import path from "path";

const uploadDir = path.resolve("uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function sanitizeFilename(originalName = "cv.pdf") {
  const base = path.basename(originalName || "cv.pdf");
  const normalized = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();

  return normalized || "cv.pdf";
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${sanitizeFilename(file.originalname)}`;
    cb(null, safeName);
  }
});

export const pdfUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Μόνο αρχεία PDF επιτρέπονται."));
      return;
    }

    cb(null, true);
  }
});

