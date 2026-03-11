const fs = require("fs");
const path = require("path");

// Carpeta donde están los PDFs
const pdfDir = path.join(__dirname, "..", "public", "pdfs");
// Fichero de salida consumido por la app
const outputFile = path.join(__dirname, "..", "src", "songs.generated.json");

// Patrón: Grupo - Título - P/L.pdf
const fileRegex = /^(?<group>.+?) - (?<title>.+?) - (?<type>P|L)\.pdf$/i;

function generate() {
  if (!fs.existsSync(pdfDir)) {
    console.warn(`La carpeta ${pdfDir} no existe todavía. No se generará songs.generated.json.`);
    writeOutput([]);
    return;
  }

  const files = fs.readdirSync(pdfDir).filter((f) => f.toLowerCase().endsWith(".pdf"));

  const map = new Map();

  for (const file of files) {
    const match = file.match(fileRegex);
    if (!match || !match.groups) {
      // Archivo con nombre “raro”: lo añadimos como entrada suelta
      const key = file;
      if (!map.has(key)) {
        map.set(key, {
          group: null,
          title: file.replace(/\.pdf$/i, ""),
          hasScore: false,
          hasLyrics: false,
          customScoreFile: null,
          customLyricsFile: null,
          rawFiles: [],
        });
      }
      const entry = map.get(key);
      entry.rawFiles.push(file);
      continue;
    }

    const { group, title, type } = match.groups;
    const key = `${group}|||${title}`;

    if (!map.has(key)) {
      map.set(key, {
        group: group.trim(),
        title: title.trim(),
        hasScore: false,
        hasLyrics: false,
        customScoreFile: null,
        customLyricsFile: null,
        rawFiles: [],
      });
    }

    const entry = map.get(key);
    entry.rawFiles.push(file);

    if (type.toUpperCase() === "P") {
      entry.hasScore = true;
      entry.customScoreFile = file;
    } else if (type.toUpperCase() === "L") {
      entry.hasLyrics = true;
      entry.customLyricsFile = file;
    }
  }

  const songs = [];
  let idCounter = 1;

  // Entrada de inicio
  songs.push({
    id: 0,
    name: "Inicio",
  });

  for (const entry of map.values()) {
    const name =
      entry.group && entry.title
        ? `${entry.group} - ${entry.title}`
        : entry.title;

    songs.push({
      id: idCounter++,
      name,
      group: entry.group,
      title: entry.title,
      hasScore: entry.hasScore,
      hasLyrics: entry.hasLyrics,
      customScoreFile: entry.customScoreFile || undefined,
      customLyricsFile: entry.customLyricsFile || undefined,
      rawFiles: entry.rawFiles,
    });
  }

  writeOutput(songs);
}

function writeOutput(songs) {
  const json = JSON.stringify(songs, null, 2);
  fs.writeFileSync(outputFile, json, "utf8");
  console.log(`Generado ${outputFile} con ${songs.length} canciones.`);
}

generate();

