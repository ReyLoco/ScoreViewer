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


export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      songs: [],
      actualId: 0,
      actualSongObj: null,
      // Filtro del listado: "all" | "score" | "lyrics"
      listFilter: "all",
      loadingSongs: true,
      loadError: null,
    };

    this.clickHandler = this.clickHandler.bind(this);
    this.setListFilter = this.setListFilter.bind(this);
    this.goHome = this.goHome.bind(this);
  } // end Constructor

  componentDidMount() {
    fetch(Constants.SONGS_API_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((songs) => {
        this.setState({
          songs,
          loadingSongs: false,
          actualId: 0,
          actualSongObj: songs[0] || null,
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
    const { songs } = this.state;

    this.setState({
      actualId: 0,
      actualSongObj: songs[0] || null,
      listFilter: "all",
    });
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

              <main className="main-content-area">
                {actualId === 0 ? (
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
