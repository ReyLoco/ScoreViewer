import React from "react";

export default function HeaderMenu({
  onSelectInicio,
  onSelectCanciones,
  onSelectLetras,
}) {
  const handleClick = (cb, targetId) => {
    if (cb) cb();
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="header-menu">
      <ul>
        <li>
          <button
            type="button"
            className="header-menu-btn"
            onClick={() => handleClick(onSelectInicio, "main-content")}
          >
            <i className="fa fa-home" aria-hidden="true" /> Inicio
          </button>
        </li>
        <li>
          <button
            type="button"
            className="header-menu-btn"
            onClick={() => handleClick(onSelectCanciones, "listado")}
          >
            <i className="fa fa-music" aria-hidden="true" /> Canciones
          </button>
        </li>
        <li>
          <button
            type="button"
            className="header-menu-btn"
            onClick={() => handleClick(onSelectLetras, "listado")}
          >
            <i className="fa fa-file-text-o" aria-hidden="true" /> Letras
          </button>
        </li>
      </ul>
    </nav>
  );
}

