import React, { Component } from "react";
import "./assets/css/App.scss";

import * as Constants from "./Constants";

// Importación de Componentes
import Header from "./components/Header";
import HeaderMenu from "./components/HeaderMenu";
import Listado from "./components/Listado";
import Introduction from "./components/Introduction";
import Footer from "./components/Footer";
import SongViewer from "./components/SongViewer";
import AdminPanel from "./components/AdminPanel";


export default class App extends Component {
  constructor(props) {
    super(props);

    const isAdminRoute = () => {
      if (typeof window === "undefined") return false;
      const p = window.location.pathname || "/";
      // Normalizamos "/admin" y "/admin/" al mismo caso
      const normalized = p.replace(/\/+$/, "");
      return normalized === "/admin";
    };

    const initialActualId = isAdminRoute() ? -1 : 0;

    this.state = {
      songs: [],
      actualId: initialActualId,
      actualSongObj: initialActualId === -1 ? null : null,
      // Filtro del listado: "all" | "score" | "lyrics"
      listFilter: "all",
      loadingSongs: true,
      loadError: null,
    };

    this.clickHandler = this.clickHandler.bind(this);
    this.setListFilter = this.setListFilter.bind(this);
    this.goHome = this.goHome.bind(this);
    this.goAdmin = this.goAdmin.bind(this);
    this.loadSongs = this.loadSongs.bind(this);
    this.scrollToSongViewerIfMobile =
      this.scrollToSongViewerIfMobile.bind(this);
  } // end Constructor

  componentDidMount() {
    this.loadSongs();
  }

  componentDidUpdate(prevProps, prevState) {
    // Al seleccionar una canción desde el listado en móvil,
    // forzamos el scroll hasta el visor para evitar que sea confuso.
    if (prevState.actualId !== this.state.actualId) {
      this.scrollToSongViewerIfMobile(this.state.actualId);
    }
  }

  scrollToSongViewerIfMobile(actualId) {
    if (typeof window === "undefined") return;
    if (!actualId || actualId <= 0) return;

    const isMobile = window.matchMedia
      ? window.matchMedia("(max-width: 800px)").matches
      : window.innerWidth <= 800;

    if (!isMobile) return;

    // Esperamos a que el DOM refleje el cambio de estado.
    window.requestAnimationFrame(() => {
      const el = document.getElementById("song-viewer");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  loadSongs() {
    this.setState({ loadingSongs: true, loadError: null });

    return fetch(Constants.SONGS_API_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((songs) => {
        this.setState((prev) => {
          const keepAdmin = prev.actualId === -1;
          return {
            songs,
            loadingSongs: false,
            actualId: keepAdmin ? -1 : 0,
            actualSongObj: keepAdmin ? null : songs[0] || null,
          };
        });
      })
      .catch((err) => {
        console.error("Error cargando canciones:", err);
        this.setState({
          loadingSongs: false,
          loadError: "No se pudo cargar el listado de canciones.",
        });
      });
  }

  // Function to change page, updating the selected song
  clickHandler(id) {
    const { songs } = this.state;

    if (id > 0) {
      this.setState({
        actualId: id,
        actualSongObj: songs.find((s) => s.id === id),
      });
    } else {
      this.setState({
        actualId: id,
      });
    }
  } // end clickHandler

  setListFilter(filter) {
    this.setState({
      listFilter: filter,
    });
  }

  goHome() {
    if (typeof window !== "undefined") {
      window.location.assign("/");
      return;
    }

    const { songs } = this.state;
    this.setState({
      actualId: 0,
      actualSongObj: songs[0] || null,
      listFilter: "all",
    });
  }

  goAdmin() {
    // La ruta /admin se protegerá en Nginx con Basic Auth.
    if (typeof window !== "undefined") {
      window.location.assign("/admin");
      return;
    }
  }

  render() {
    const {
      songs,
      listFilter,
      actualId,
      actualSongObj,
      loadingSongs,
      loadError,
    } = this.state;

    return (
      <div className="App container-fluid text-center">
        <section className="section-header">
          <Header
            title={Constants.APP_TITLE}
            slogan={
              Constants.APP_S_SLOGAN
            }
          />
          <HeaderMenu
            onSelectInicio={this.goHome}
            onSelectCanciones={() => this.setListFilter("score")}
            onSelectLetras={() => this.setListFilter("lyrics")}
            onSelectAdmin={this.goAdmin}
          />
        </section>

        <section className="main-layout">
          {loadingSongs ? (
            <p>Cargando canciones...</p>
          ) : loadError ? (
            <p>{loadError}</p>
          ) : (
            <>
              <aside className="main-sidebar">
                <Listado
                  songs={songs}
                  filter={listFilter}
                  clickHandler={this.clickHandler}
                  selectedSongId={actualId}
                />
              </aside>

              <main id="main-content" className="main-content-area">
                {actualId === -1 ? (
                  <AdminPanel
                    songs={songs}
                    onSongsChanged={(nextSongs) =>
                      this.setState({ songs: nextSongs })
                    }
                    onReload={this.loadSongs}
                  />
                ) : actualId === 0 ? (
                  <Introduction
                    introductionText={Constants.S_INTRODUCTION_TEXT}
                  />
                ) : (
                  <SongViewer
                    song={actualSongObj}
                    folder={Constants.SONGS_FOLDER}
                  />
                )}
              </main>
            </>
          )}
        </section>

        <section className="section-footer">
          <Footer />
        </section>
      </div>
    ); // end return
  } // end render
} // end class App
