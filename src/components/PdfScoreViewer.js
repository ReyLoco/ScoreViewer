import React, { useState, useCallback, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL || ""}/pdf.worker.min.mjs`;

export default function PdfScoreViewer({ fileUrl, documentTitle }) {
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(800);
  const [loadError, setLoadError] = useState(null);
  const containerRef = useRef(null);

  const updateWidth = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w > 0) {
      setPageWidth(Math.min(Math.floor(w), 1400));
    }
  }, []);

  useEffect(() => {
    setNumPages(null);
    setLoadError(null);
  }, [fileUrl]);

  useEffect(() => {
    updateWidth();
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }
    const ro = new ResizeObserver(() => updateWidth());
    ro.observe(el);
    window.addEventListener("resize", updateWidth);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, [updateWidth, fileUrl, numPages]);

  const onDocumentLoadSuccess = useCallback(({ numPages: n }) => {
    setNumPages(n);
    setLoadError(null);
  }, []);

  const onDocumentLoadError = useCallback((err) => {
    console.error("PDF load error:", err);
    setLoadError(err);
  }, []);

  if (loadError) {
    return (
      <div className="song-viewer-frame song-viewer-pdf-error">
        <p>
          No se pudo cargar el PDF en la página. Puedes abrirlo aparte:{" "}
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            Abrir PDF
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="song-viewer-frame">
      <div
        className="song-viewer-pdf-pages"
        ref={containerRef}
        aria-label={documentTitle ? `PDF: ${documentTitle}` : "Partitura PDF"}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className="song-viewer-pdf-loading">Cargando PDF…</div>}
          options={{
            withCredentials: false,
          }}
        >
          {numPages
            ? Array.from({ length: numPages }, (_, i) => (
                <Page
                  key={`page_${i + 1}`}
                  pageNumber={i + 1}
                  width={pageWidth}
                  renderTextLayer={false}
                  className="song-viewer-pdf-page"
                />
              ))
            : null}
        </Document>
      </div>
      <p className="song-viewer-pdf-external-hint">
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          Abrir PDF en otra pestaña
        </a>
      </p>
    </div>
  );
}
