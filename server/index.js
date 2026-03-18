const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { generateSongs, fileRegex } = require("../scripts/songsGenerator");

const app = express();
const PORT = process.env.PORT || 4000;

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

// Servimos PDFs desde la API para que el frontend pueda mostrarlos aunque no estén en public/
// Ejemplo: GET /pdfs/ACDC%20-%20Back%20In%20Black%20-%20P.pdf
app.use("/pdfs", express.static(pdfDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pdfDir);
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

app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se ha recibido ningún archivo" });
    }

    const songs = generateSongs(pdfDir);
    res.status(201).json({
      message: "Archivo subido correctamente",
      fileName: req.file.filename,
      songs,
    });
  } catch (err) {
    console.error("Error al subir archivo:", err);
    res.status(500).json({ error: "Error al subir el archivo" });
  }
});

app.put("/api/files/:fileName", (req, res) => {
  try {
    const { fileName } = req.params;
    const { newGroup, newTitle, newType } = req.body || {};

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

    // Nota: por simplicidad, el rename mueve el archivo al directorio raíz de pdfDir.
    // Si en el futuro quieres mantener subcarpetas (General/Propias), añadimos un parámetro "folder".
    const newName = buildPdfName(newGroup, newTitle, newType);
    const newPath = path.resolve(pdfDir, newName);

    fs.renameSync(currentPath, newPath);

    const songs = generateSongs(pdfDir);
    res.json({
      message: "Archivo renombrado correctamente",
      oldFileName: decodeURIComponent(fileName),
      newFileName: newName,
      songs,
    });
  } catch (err) {
    console.error("Error al renombrar archivo:", err);
    res.status(500).json({ error: "Error al renombrar el archivo" });
  }
});

app.delete("/api/files/:fileName", (req, res) => {
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

app.listen(PORT, () => {
  console.log(`ScoreViewer API escuchando en http://localhost:${PORT}`);
});

