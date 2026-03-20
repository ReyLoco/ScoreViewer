const fs = require("fs");
const path = require("path");

// Patrón: Grupo - Título - P/L.pdf
const fileRegex = /^(?<group>.+?) - (?<title>.+?) - (?<type>P|L)\.pdf$/i;

function listPdfRelativePathsRecursive(rootDir) {
  const out = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(currentDir, ent.name);

      if (ent.isDirectory()) {
        walk(full);
        continue;
      }

      if (!ent.isFile()) continue;
      if (!ent.name.toLowerCase().endsWith(".pdf")) continue;

      out.push(path.relative(rootDir, full));
    }
  }

  walk(rootDir);

  // Normalizamos a separador "/" para que funcione igual en Windows/Linux
  return out
    .map((p) => p.split(path.sep).join("/"))
    .sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
}

function generateSongs(pdfDir) {
  if (!fs.existsSync(pdfDir)) {
    return [];
  }

  const files = listPdfRelativePathsRecursive(pdfDir);

  const map = new Map();

  for (const file of files) {
    const baseName = path.posix.basename(file);
    const match = baseName.match(fileRegex);
    if (!match || !match.groups) {
      const key = file;
      if (!map.has(key)) {
        map.set(key, {
          group: null,
          title: baseName.replace(/\.pdf$/i, ""),
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

  return songs;
}

module.exports = {
  generateSongs,
  fileRegex,
};

