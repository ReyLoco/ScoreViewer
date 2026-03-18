import React, { useMemo, useState } from "react";
import * as Constants from "../Constants";

function normalizeType(t) {
  return (t || "P").toUpperCase() === "L" ? "L" : "P";
}

function guessFilesFromSong(song) {
  if (!song) return [];

  const files = [];

  if (song.customScoreFile) files.push({ fileName: song.customScoreFile });
  if (song.customLyricsFile) files.push({ fileName: song.customLyricsFile });

  (song.rawFiles || []).forEach((f) => files.push({ fileName: f }));

  const seen = new Set();
  return files.filter(({ fileName }) => {
    if (!fileName) return false;
    const key = fileName.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function AdminPanel({ songs = [], onSongsChanged, onReload }) {
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadGroup, setUploadGroup] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState("P");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const [selectedFile, setSelectedFile] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("P");

  const files = useMemo(() => {
    const all = [];
    songs.forEach((s) => {
      if (!s || s.id === 0) return;
      guessFilesFromSong(s).forEach(({ fileName }) => {
        all.push({ song: s, fileName });
      });
    });

    const seen = new Set();
    return all.filter((it) => {
      const key = it.fileName.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [songs]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!uploadFile) {
      setMessage({ type: "error", text: "Selecciona un PDF para subir." });
      return;
    }

    const fd = new FormData();
    fd.append("file", uploadFile);

    if (uploadGroup.trim() && uploadTitle.trim()) {
      fd.append("group", uploadGroup.trim());
      fd.append("title", uploadTitle.trim());
      fd.append("type", normalizeType(uploadType));
    }

    setBusy(true);
    try {
      const res = await fetch(Constants.API_UPLOAD_URL, {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Error subiendo el archivo");
      }

      setMessage({
        type: "ok",
        text: `Subido correctamente: ${data.fileName}`,
      });

      setUploadFile(null);
      if (typeof onSongsChanged === "function" && Array.isArray(data.songs)) {
        onSongsChanged(data.songs);
      } else if (typeof onReload === "function") {
        onReload();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || String(err) });
    } finally {
      setBusy(false);
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedFile) {
      setMessage({ type: "error", text: "Selecciona un archivo a renombrar." });
      return;
    }
    if (!newGroup.trim() || !newTitle.trim()) {
      setMessage({
        type: "error",
        text: "Indica nuevo grupo y nuevo título.",
      });
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(Constants.apiFileUrl(selectedFile), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newGroup: newGroup.trim(),
          newTitle: newTitle.trim(),
          newType: normalizeType(newType),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Error renombrando el archivo");
      }

      setMessage({
        type: "ok",
        text: `Renombrado: ${data.oldFileName} → ${data.newFileName}`,
      });

      if (typeof onSongsChanged === "function" && Array.isArray(data.songs)) {
        onSongsChanged(data.songs);
      } else if (typeof onReload === "function") {
        onReload();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || String(err) });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setMessage(null);
    if (!selectedFile) {
      setMessage({ type: "error", text: "Selecciona un archivo a eliminar." });
      return;
    }

    // eslint-disable-next-line no-alert
    const ok = window.confirm(`¿Seguro que quieres eliminar "${selectedFile}"?`);
    if (!ok) return;

    setBusy(true);
    try {
      const res = await fetch(Constants.apiFileUrl(selectedFile), {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Error eliminando el archivo");
      }

      setMessage({ type: "ok", text: `Eliminado: ${data.fileName}` });
      setSelectedFile("");

      if (typeof onSongsChanged === "function" && Array.isArray(data.songs)) {
        onSongsChanged(data.songs);
      } else if (typeof onReload === "function") {
        onReload();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || String(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="admin-panel" className="admin-panel">
      <h2>Administración</h2>
      <p className="admin-hint">
        Desde aquí puedes subir, renombrar o eliminar PDFs del servidor usando la
        API.
      </p>

      {message && (
        <div className={`admin-msg ${message.type === "ok" ? "ok" : "error"}`}>
          {message.text}
        </div>
      )}

      <div className="admin-grid">
        <div className="admin-card">
          <h3>Subir PDF</h3>
          <form onSubmit={handleUpload}>
            <div className="admin-row">
              <label>
                Archivo (PDF)
                <input
                  type="file"
                  accept="application/pdf"
                  disabled={busy}
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="admin-row admin-row-3">
              <label>
                Grupo (opcional)
                <input
                  type="text"
                  value={uploadGroup}
                  disabled={busy}
                  onChange={(e) => setUploadGroup(e.target.value)}
                  placeholder="ACDC"
                />
              </label>
              <label>
                Título (opcional)
                <input
                  type="text"
                  value={uploadTitle}
                  disabled={busy}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Back In Black"
                />
              </label>
              <label>
                Tipo
                <select
                  value={uploadType}
                  disabled={busy}
                  onChange={(e) => setUploadType(e.target.value)}
                >
                  <option value="P">Partitura (P)</option>
                  <option value="L">Letra (L)</option>
                </select>
              </label>
            </div>

            <button type="submit" className="admin-btn" disabled={busy}>
              {busy ? "Procesando..." : "Subir"}
            </button>
          </form>
        </div>

        <div className="admin-card">
          <h3>Renombrar / eliminar PDF</h3>

          <div className="admin-row">
            <label>
              Archivo
              <select
                value={selectedFile}
                disabled={busy}
                onChange={(e) => setSelectedFile(e.target.value)}
              >
                <option value="">Selecciona…</option>
                {files.map((f) => (
                  <option key={f.fileName} value={f.fileName}>
                    {f.fileName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <form onSubmit={handleRename}>
            <div className="admin-row admin-row-3">
              <label>
                Nuevo grupo
                <input
                  type="text"
                  value={newGroup}
                  disabled={busy}
                  onChange={(e) => setNewGroup(e.target.value)}
                />
              </label>
              <label>
                Nuevo título
                <input
                  type="text"
                  value={newTitle}
                  disabled={busy}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </label>
              <label>
                Nuevo tipo
                <select
                  value={newType}
                  disabled={busy}
                  onChange={(e) => setNewType(e.target.value)}
                >
                  <option value="P">P</option>
                  <option value="L">L</option>
                </select>
              </label>
            </div>

            <div className="admin-actions">
              <button type="submit" className="admin-btn" disabled={busy}>
                {busy ? "Procesando..." : "Renombrar"}
              </button>
              <button
                type="button"
                className="admin-btn danger"
                disabled={busy}
                onClick={handleDelete}
              >
                Eliminar
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

