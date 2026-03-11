import React, { useState, useMemo, useEffect } from "react";

export default function Listado({
  songs = [],
  filter = "all",
  clickHandler,
  selectedSongId,
}) {
  const [openGroup, setOpenGroup] = useState(null);
  const [letterFilter, setLetterFilter] = useState("all"); // "all" o una letra A-Z

  const { groups, titleSuffix } = useMemo(() => {
    const filtered = songs.filter((s) => {
      if (!s || s.id === 0) return false; // Saltamos "Inicio" y entradas vacías

      if (filter === "score") {
        return s.hasScore || !!s.customScoreFile;
      }
      if (filter === "lyrics") {
        return s.hasLyrics || !!s.customLyricsFile;
      }
      return true;
    });

    const map = {};
    filtered.forEach((song) => {
      const groupName = song.group || "Sin grupo";
      if (!map[groupName]) {
        map[groupName] = [];
      }
      map[groupName].push(song);
    });

    const sortedGroups = Object.keys(map).sort((a, b) =>
      a.localeCompare(b, "es", { sensitivity: "base" })
    );

    sortedGroups.forEach((g) => {
      map[g].sort((a, b) =>
        (a.title || a.name || "").localeCompare(
          b.title || b.name || "",
          "es",
          { sensitivity: "base" }
        )
      );
    });

    let suffix = "";
    if (filter === "score") suffix = " (Canciones con partitura)";
    if (filter === "lyrics") suffix = " (Letras)";

    return { groups: { order: sortedGroups, map }, titleSuffix: suffix };
  }, [songs, filter]);

  const handleToggleGroup = (groupName) => {
    setOpenGroup((prev) => (prev === groupName ? null : groupName));
  };

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const visibleGroupOrder =
    letterFilter === "all"
      ? groups.order
      : groups.order.filter((g) =>
          (g || "").toUpperCase().startsWith(letterFilter)
        );

  const handleSelectLetter = (ltr) => {
    setLetterFilter(ltr);
    setOpenGroup(null);
  };

  // Siempre que cambie el filtro principal o la letra, colapsamos grupos
  useEffect(() => {
    setOpenGroup(null);
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

      {visibleGroupOrder.length === 0 ? (
        <p>No hay elementos para este filtro.</p>
      ) : (
        <div className="listado-groups">
          {visibleGroupOrder.map((groupName) => (
            <div key={groupName} className="listado-group">
              <button
                type="button"
                className={`listado-group-btn ${
                  openGroup === groupName ? "open" : ""
                }`}
                onClick={() => handleToggleGroup(groupName)}
              >
                {groupName}
              </button>

              {openGroup === groupName && (
                <ul className="listado-songs">
                  {groups.map[groupName].map((song) => (
                    <li
                      key={song.id}
                      className={
                        selectedSongId === song.id ? "selected-song" : ""
                      }
                    >
                      <button
                        type="button"
                        className="listado-song-btn"
                        onClick={() => clickHandler && clickHandler(song.id)}
                      >
                        {song.title || song.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

