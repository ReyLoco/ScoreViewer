/**
 * Importar antes del árbol de la app (ver index.js).
 * react-pdf fija por defecto workerSrc = 'pdf.worker.mjs' (no existe en CRA → el PDF no carga).
 * Servimos pdf.worker.min.mjs desde /public (scripts/copyPdfWorker.js en postinstall).
 */
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL || ""}/pdf.worker.min.mjs`;
