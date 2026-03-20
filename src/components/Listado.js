import React, { useState, useMemo, useEffect } from "react";

function inferCollectionKey(song) {
  const hints = [
    song?.customScoreFile,
    song?.customLyricsFile,
    ...(song?.rawFiles || []),
  ].filter(Boolean);

  // En producción/proyecto: rutas relativas tipo "General/<archivo>.pdf" o "Propias/<archivo>.pdf".
  // Normalizamos por si vinieran con "/" o con "\" (aunque el generator ya normaliza a "/").
  const lower = hints.map((h) =>
    String(h).replace(/\\/g, "/").toLowerCase()
  );

  const hasPropias = lower.some((f) => f.startsWith("propias/"));
  const hasGeneral = lower.some((f) => f.startsWith("general/"));

  if (hasPropias) return "Propias";
  if (hasGeneral) return "General";

  // Fallback: si no hay subcarpeta en el listado (p.ej. datos de desarrollo sin carpeta),
  // asumimos que pertenece a "General".
  return "General";
}

function applyMainFilter(song, filter) {
  if (!song) return false;
  if (filter === "score") return song.hasScore || !!song.customScoreFile;
  if (filter === "lyrics") return song.hasLyrics || !!song.customLyricsFile;
  return true;
}

function buildGroupsForSongs(songsSubset) {
  const map = {};

  songsSubset.forEach((song) => {
    const groupName = song.group || "Sin grupo";
    if (!map[groupName]) map[groupName] = [];
    map[groupName].push(song);
  });

  const order = Object.keys(map).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  );

  order.forEach((g) => {
    map[g].sort((a, b) =>
      (a.title || a.name || "").localeCompare(b.title || b.name || "", "es", {
        sensitivity: "base",
      })
    );
  });

  return { order, map };
}

export default function Listado({
  songs = [],
  filter = "all",
  clickHandler,
  selectedSongId,
}) {
  const [openGroupKey, setOpenGroupKey] = useState(null);
  const [letterFilter, setLetterFilter] = useState("all"); // "all" o una letra A-Z

  const { collections, titleSuffix } = useMemo(() => {
    const filtered = songs.filter((s) => {
      if (!s || s.id === 0) return false; // Saltamos "Inicio" y entradas vacías
      return applyMainFilter(s, filter);
    });

    const byCollection = {
      General: [],
      Propias: [],
    };

    filtered.forEach((song) => {
      const colKey = inferCollectionKey(song);
      byCollection[colKey].push(song);
    });

    const suffix = (() => {
      if (filter === "score") return " (Canciones con partitura)";
      if (filter === "lyrics") return " (Letras)";
      return "";
    })();

    return {
      titleSuffix: suffix,
      collections: [
        {
          key: "General",
          label: "General",
          ...buildGroupsForSongs(byCollection.General),
        },
        {
          key: "Propias",
          label: "Luis Massó",
          ...buildGroupsForSongs(byCollection.Propias),
        },
      ],
    };
  }, [songs, filter]);

  const handleToggleGroup = (collectionKey, groupName) => {
    const nextKey = `${collectionKey}::${groupName}`;
    setOpenGroupKey((prev) => (prev === nextKey ? null : nextKey));
  };

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const handleSelectLetter = (ltr) => {
    setLetterFilter(ltr);
    setOpenGroupKey(null);
  };

  // Siempre que cambie el filtro principal o la letra, colapsamos grupos
  useEffect(() => {
    setOpenGroupKey(null);
  }, [filter, letterFilter]);

  return (
    <section id="listado" className="section-listado">
      <h2>Listado{titleSuffix}</h2>

      <div className="listado-letters">
        {letters.map((ltr) => (
          <button
            key={ltr}
            type="button"
            className={`listado-letter-btn ${
              letterFilter === ltr ? "active" : ""
            }`}
            onClick={() => handleSelectLetter(ltr)}
          >
            {ltr}
          </button>
        ))}
        <button
          type="button"
          className={`listado-letter-btn ${
            letterFilter === "all" ? "active" : ""
          }`}
          onClick={() => handleSelectLetter("all")}
        >
          Todos
        </button>
      </div>

      {collections.map((col) => {
        const visibleGroupOrder =
          letterFilter === "all"
            ? col.order
            : col.order.filter((g) =>
                (g || "").toUpperCase().startsWith(letterFilter)
              );

        return (
          <div key={col.key}>
            <h3 style={{ marginTop: "1rem", marginBottom: "0.75rem" }}>
              {col.label}
            </h3>

            {visibleGroupOrder.length === 0 ? (
              <p>No hay elementos para este filtro.</p>
            ) : (
              <div className="listado-groups">
                {visibleGroupOrder.map((groupName) => {
                  const openKey = `${col.key}::${groupName}`;
                  return (
                    <div key={groupName} className="listado-group">
                      <button
                        type="button"
                        className={`listado-group-btn ${
                          openGroupKey === openKey ? "open" : ""
                        }`}
                        onClick={() => handleToggleGroup(col.key, groupName)}
                      >
                        {groupName}
                      </button>

                      {openGroupKey === openKey && (
                        <ul className="listado-songs">
                          {col.map[groupName].map((song) => (
                            <li
                              key={song.id}
                              className={
                                selectedSongId === song.id ? "selected-song" : ""
                              }
                            >
                              <button
                                type="button"
                                className="listado-song-btn"
                                onClick={() =>
                                  clickHandler && clickHandler(song.id)
                                }
                              >
                                {song.title || song.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

