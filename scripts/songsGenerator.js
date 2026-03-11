const fs = require("fs");
const path = require("path");

// Patrón: Grupo - Título - P/L.pdf
const fileRegex = /^(?<group>.+?) - (?<title>.+?) - (?<type>P|L)\.pdf$/i;

function generateSongs(pdfDir) {
  if (!fs.existsSync(pdfDir)) {
    return [];
  }

  const files = fs
    .readdirSync(pdfDir)
    .filter((f) => f.toLowerCase().endsWith(".pdf"));

  const map = new Map();

  for (const file of files) {
    const match = file.match(fileRegex);
    if (!match || !match.groups) {
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

