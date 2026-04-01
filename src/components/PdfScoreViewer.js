import React, { useState, useCallback, useRef, useEffect } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

export default function PdfScoreViewer({ fileUrl, documentTitle }) {
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(() =>
    typeof window !== "undefined"
      ? Math.min(Math.max(window.innerWidth - 48, 280), 1400)
      : 800
  );
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
      <div className="song-viewer-frame">
        <p className="song-viewer-pdf-error-msg">
          El visor integrado no pudo cargar el PDF. Mostrando el visor del navegador si está disponible.
        </p>
        <div className="song-viewer-pdf-pages song-viewer-pdf-pages--native">
          <object
            className="song-viewer-pdf-native"
            data={fileUrl}
            type="application/pdf"
            title={documentTitle || "Partitura PDF"}
          >
            <p className="song-viewer-pdf-error">
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                Abrir PDF
              </a>
            </p>
          </object>
        </div>
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
        >
          {numPages != null && numPages > 0
            ? Array.from({ length: numPages }, (_, i) => (
                <Page
                  key={`page_${i + 1}`}
                  pageNumber={i + 1}
                  width={Math.max(pageWidth, 240)}
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
