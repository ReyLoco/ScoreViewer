import React, { Component } from "react";
import * as Constants from "../Constants";

/**
 * Acceso directo / PWA o entornos sin visor PDF integrado: el <object> suele
 * mostrar solo el fallback. Ofrecemos iframe + enlace explícito al PDF.
 */
function needsPdfEmbeddedFallbackUi() {
  if (typeof window === "undefined") return false;
  if (typeof navigator !== "undefined" && navigator.standalone === true) {
    return true;
  }
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.pdfViewerEnabled === "boolean" &&
    !navigator.pdfViewerEnabled
  ) {
    return true;
  }
  try {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches
    );
  } catch {
    return false;
  }
}

export default class SongViewer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      view: "score", // "score" (P) o "lyrics" (L)
    };

    this.setView = this.setView.bind(this);
  }

  componentDidUpdate(prevProps) {
    // Si cambiamos de canción, reseteamos la vista por defecto
    if (
      prevProps.song &&
      this.props.song &&
      prevProps.song.id !== this.props.song.id
    ) {
      this.setState({
        view: this.getDefaultView(this.props.song),
      });
    }
  }

  getDefaultView(song) {
    if (!song) return "score";
    if (song.hasScore) return "score";
    if (song.hasLyrics) return "lyrics";
    return "score";
  }

  setView(view) {
    this.setState({ view });
  }

  render() {
    const { song, folder } = this.props;

    if (!song || (!song.group && !song.title)) {
      return (
        <section id="song-viewer" className="container-fluid">
          <h3>
            Selecciona una canción en el menú
          </h3>
        </section>
      );
    }

    const hasScore = song.hasScore !== false;
    const hasLyrics = song.hasLyrics === true;

    const scoreFile = song.customScoreFile || null;
    const lyricsFile = song.customLyricsFile || null;

    const currentFile =
      this.state.view === "lyrics" ? lyricsFile || scoreFile : scoreFile || lyricsFile;

    // En este proyecto los PDFs se sirven desde el backend (GET /pdfs/<file>)
    // Así no dependemos de que existan en el build estático.
    const basePath =
      Constants.PDF_BASE_URL || `${process.env.PUBLIC_URL || ""}/${folder}`;
    // encodeURI mantiene los "/" de subcarpetas y codifica espacios, acentos, etc.
    const pdfUrl = currentFile ? `${basePath}${encodeURI(currentFile)}` : null;
    const downloadFileName = currentFile
      ? decodeURIComponent(String(currentFile).split("/").pop())
      : null;

    const description = song.descriptionEs;
    const pdfFallbackUi = needsPdfEmbeddedFallbackUi();

    return (
      <section id="song-viewer" className="container-fluid">
        <h3>{song.name}</h3>
        {description && <p>{description}</p>}

        <div className="song-viewer-toggle">
          <button
            type="button"
            className={`btn btn-default ${
              this.state.view === "lyrics" ? "active" : ""
            }`}
            onClick={() => this.setView("lyrics")}
            disabled={!hasLyrics && !lyricsFile}
          >
            Letra
          </button>
          <button
            type="button"
            className={`btn btn-default ${
              this.state.view === "score" ? "active" : ""
            }`}
            onClick={() => this.setView("score")}
            disabled={!hasScore && !scoreFile}
          >
            Partitura
          </button>

          {pdfUrl && (
            <a
              className="song-viewer-download-btn"
              href={pdfUrl}
              aria-label="Descargar PDF"
              download={downloadFileName || true}
            >
              <i className="fa fa-cloud-download" aria-hidden="true" /> Descargar
            </a>
          )}
        </div>

        {!pdfUrl ? (
          <p>
            No hay PDF disponible para esta canción.
          </p>
        ) : pdfFallbackUi ? (
          <div className="song-viewer-frame song-viewer-frame--embedded-fallback">
            <p className="song-viewer-embedded-fallback-hint">
              Desde el acceso directo o este modo de pantalla, el PDF a veces no se puede
              incrustar. Usa el botón para abrirlo en el navegador o en el visor del sistema.
            </p>
            <a
              className="song-viewer-open-pdf-btn"
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir partitura
            </a>
            <iframe
              className="song-viewer-pdf"
              title={`Partitura: ${song.name}`}
              src={pdfUrl}
            />
          </div>
        ) : (
          <div className="song-viewer-frame">
            <object
              className="song-viewer-pdf"
              data={pdfUrl}
              type="application/pdf"
              width="100%"
            >
              <p>
                Tu navegador no puede mostrar el PDF. Puedes abrirlo en una nueva pestaña:{" "}
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  Abrir PDF
                </a>
              </p>
            </object>
          </div>
        )}
      </section>
    );
  }
}

