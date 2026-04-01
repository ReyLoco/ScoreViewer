/**
 * Copia el worker de PDF.js a public/ para que coincida con pdfjs-dist instalado.
 */
const fs = require("fs");
const path = require("path");

const src = path.join(
  __dirname,
  "..",
  "node_modules",
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs"
);
const dest = path.join(__dirname, "..", "public", "pdf.worker.min.mjs");

if (!fs.existsSync(src)) {
  console.warn("copyPdfWorker: no se encontró pdf.worker.min.mjs en pdfjs-dist.");
  process.exit(0);
}

fs.copyFileSync(src, dest);
console.log("copyPdfWorker: actualizado public/pdf.worker.min.mjs");
