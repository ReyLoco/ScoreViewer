export const SONGS_FOLDER = "pdfs/";

export const APP_TITLE = "ScoreViewer";

export const APP_E_SLOGAN = "A simple viewer for music scores and song sheets";
export const APP_S_SLOGAN = "Un visor sencillo de partituras y letras de canciones";

export const E_INTRODUCTION_TEXT = [
  "Welcome to ScoreViewer.",
  "Here you can browse a small collection of songs and open their PDF scores or lyrics.",
  "Use the menu to select a song. The PDF will be displayed directly in the page and you can also open it in a new tab."
];

export const S_INTRODUCTION_TEXT = [
  "Bienvenido a ScoreViewer.",
  "Aquí puedes navegar por una pequeña colección de canciones y abrir sus partituras o letras en PDF.",
  "Usa el menú para seleccionar una canción. El PDF se mostrará directamente en la página y también podrás abrirlo en una nueva pestaña."
];

// Lista de canciones generada automáticamente a partir de los PDFs
// en `public/pdfs` mediante `scripts/generateSongs.js`.
// Cada vez que ejecutes `npm start` o `npm run build`
// se regenerará `songs.generated.json`.
// Puedes editar ese JSON a mano si quieres añadir descripciones, etc.
// eslint-disable-next-line import/no-anonymous-default-export, @typescript-eslint/no-var-requires
export const SONGS = require("./songs.generated.json");
