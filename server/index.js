const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { generateSongs, fileRegex } = require("../scripts/songsGenerator");

const app = express();
const PORT = process.env.PORT || 4000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

// Carpeta donde se guardan los PDFs (y opcionalmente otros originales como .odt)
// En producción recomendamos algo como: /srv/scoreviewer/partituras
const pdfDir =
  process.env.PDF_DIR || path.join(__dirname, "..", "public", "pdfs");

if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      process.env.ALLOWED_ORIGIN,
    ].filter(Boolean),
  })
);

app.use(express.json());

function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) {
    return res.status(500).json({
      error: "ADMIN_TOKEN no está configurado en el servidor",
    });
  }

  const provided = req.header("X-Admin-Token");
  if (!provided || provided !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "No autorizado" });
  }

  return next();
}

// Servimos PDFs desde la API para que el frontend pueda mostrarlos aunque no estén en public/
// Ejemplo: GET /pdfs/ACDC%20-%20Back%20In%20Black%20-%20P.pdf
app.use("/pdfs", express.static(pdfDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const folder = sanitizeFolder(req.body?.folder);
      const destDir = folder ? path.join(pdfDir, folder) : pdfDir;
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      cb(null, destDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    const group = req.body.group;
    const title = req.body.title;
    const type = req.body.type;

    let finalName = originalName;

    if (group && title && type) {
      finalName = buildPdfName(group, title, type);
    } else {
      const match = originalName.match(fileRegex);
      if (match && match.groups) {
        finalName = buildPdfName(
          match.groups.group,
          match.groups.title,
          match.groups.type
        );
      }
    }

    if (!finalName.toLowerCase().endsWith(".pdf")) {
      finalName += ".pdf";
    }

    cb(null, finalName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Solo se permiten archivos PDF"));
    }
    cb(null, true);
  },
});

function toTitleCase(str) {
  return (str || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function buildPdfName(group, title, type) {
  const safeGroup = toTitleCase(group).replace(/[\/\\]/g, "-");
  const safeTitle = toTitleCase(title).replace(/[\/\\]/g, "-");
  const safeType = (type || "P").toUpperCase() === "L" ? "L" : "P";
  return `${safeGroup} - ${safeTitle} - ${safeType}.pdf`;
}

function sanitizeFolder(folder) {
  if (folder == null) return "";
  const trimmed = String(folder).trim();
  if (!trimmed) return "";
  if (trimmed.includes("..") || trimmed.includes("/") || trimmed.includes("\\")) {
    throw new Error("Carpeta no válida");
  }
  // Permitimos únicamente carpetas simples (p.ej. "General", "Propias")
  if (!/^[\w .-]+$/.test(trimmed)) {
    throw new Error("Carpeta no válida");
  }
  return trimmed;
}

function ensureInsidePdfDir(fileName) {
  const decoded = decodeURIComponent(fileName);
  if (decoded.includes("..") || path.isAbsolute(decoded)) {
    throw new Error("Nombre de archivo no válido");
  }

  const target = path.resolve(pdfDir, decoded);
  const base = path.resolve(pdfDir);
  if (target === base) {
    throw new Error("Nombre de archivo no válido");
  }
  if (!target.startsWith(base + path.sep)) {
    throw new Error("Nombre de archivo no válido");
  }

  return target;
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "ScoreViewer API funcionando" });
});

app.get("/api/songs", (req, res) => {
  try {
    const songs = generateSongs(pdfDir);
    res.json(songs);
  } catch (err) {
    console.error("Error al generar songs:", err);
    res.status(500).json({ error: "No se pudo generar el listado de canciones" });
  }
});

app.post("/api/upload", requireAdmin, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se ha recibido ningún archivo" });
    }

    const folder = sanitizeFolder(req.body?.folder);
    const songs = generateSongs(pdfDir);
    res.status(201).json({
      message: "Archivo subido correctamente",
      fileName: folder ? `${folder}/${req.file.filename}` : req.file.filename,
      songs,
    });
  } catch (err) {
    console.error("Error al subir archivo:", err);
    res.status(500).json({ error: "Error al subir el archivo" });
  }
});

app.put("/api/files/:fileName", requireAdmin, (req, res) => {
  try {
    const { fileName } = req.params;
    const { newGroup, newTitle, newType, newFolder } = req.body || {};

    if (!newGroup || !newTitle || !newType) {
      return res.status(400).json({
        error:
          "Debes enviar newGroup, newTitle y newType (P o L) para renombrar el archivo",
      });
    }

    const currentPath = ensureInsidePdfDir(fileName);
    if (!fs.existsSync(currentPath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    const newName = buildPdfName(newGroup, newTitle, newType);
    const decodedOld = decodeURIComponent(fileName);
    const oldDir = path.dirname(decodedOld);
    const oldDirIsRoot = oldDir === "." || oldDir === path.sep;
    const targetFolder = sanitizeFolder(newFolder);
    const targetDirRel = targetFolder
      ? targetFolder
      : oldDirIsRoot
        ? ""
        : oldDir;

    const newRel = targetDirRel ? path.join(targetDirRel, newName) : newName;
    const newPath = ensureInsidePdfDir(encodeURIComponent(newRel));
    const newDirAbs = path.dirname(newPath);
    if (!fs.existsSync(newDirAbs)) {
      fs.mkdirSync(newDirAbs, { recursive: true });
    }

    fs.renameSync(currentPath, newPath);

    const songs = generateSongs(pdfDir);
    res.json({
      message: "Archivo renombrado correctamente",
      oldFileName: decodeURIComponent(fileName),
      newFileName: newRel.replace(/\\/g, "/"),
      songs,
    });
  } catch (err) {
    console.error("Error al renombrar archivo:", err);
    res.status(500).json({ error: "Error al renombrar el archivo" });
  }
});

app.delete("/api/files/:fileName", requireAdmin, (req, res) => {
  try {
    const { fileName } = req.params;
    const targetPath = ensureInsidePdfDir(fileName);

    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    fs.unlinkSync(targetPath);
    const songs = generateSongs(pdfDir);

    res.json({
      message: "Archivo eliminado correctamente",
      fileName: decodeURIComponent(fileName),
      songs,
    });
  } catch (err) {
    console.error("Error al eliminar archivo:", err);
    res.status(500).json({ error: "Error al eliminar el archivo" });
  }
});

// Errores de multer (upload) y validación en destination/filename
app.use((err, req, res, next) => {
  if (!err) return next();
  const msg = err.message || "Error procesando la petición";
  res.status(400).json({ error: msg });
});

app.listen(PORT, () => {
  console.log(`ScoreViewer API escuchando en http://localhost:${PORT}`);
});

