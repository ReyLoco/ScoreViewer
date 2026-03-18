export const SONGS_FOLDER = "pdfs/";

export const APP_TITLE = "ScoreViewer";

export const APP_E_SLOGAN = "A simple viewer for music scores and song sheets";
export const APP_S_SLOGAN =
  "Un visor sencillo de partituras y letras de canciones";

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

// URL de la API para obtener la lista de canciones
// En desarrollo usaremos el backend Node local por defecto
export const SONGS_API_URL =
  process.env.REACT_APP_SONGS_API_URL || "http://localhost:4000/api/songs";

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

export const API_UPLOAD_URL = `${API_BASE_URL}/api/upload`;

export function apiFileUrl(fileName) {
  return `${API_BASE_URL}/api/files/${encodeURIComponent(fileName)}`;
}

// Base para servir PDFs desde el backend (server/index.js expone /pdfs)
export const PDF_BASE_URL =
  process.env.REACT_APP_PDF_BASE_URL || `${API_BASE_URL}/pdfs/`;
