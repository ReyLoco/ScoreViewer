const fs = require("fs");
const path = require("path");
const { generateSongs } = require("./songsGenerator");

// Carpeta donde están los PDFs
const pdfDir = path.join(__dirname, "..", "public", "pdfs");
// Fichero de salida consumido por la app en modo estático
const outputFile = path.join(__dirname, "..", "src", "songs.generated.json");

function writeOutput(songs) {
  const json = JSON.stringify(songs, null, 2);
  fs.writeFileSync(outputFile, json, "utf8");
  console.log(`Generado ${outputFile} con ${songs.length} canciones.`);
}

function main() {
  if (!fs.existsSync(pdfDir)) {
    console.warn(
      `La carpeta ${pdfDir} no existe todavía. No se generará songs.generated.json.`
    );
    writeOutput([]);
    return;
  }

  const songs = generateSongs(pdfDir);
  writeOutput(songs);
}

main();

