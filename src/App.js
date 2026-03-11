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
      actualId: 0,
      actualSongObj: Constants.SONGS[0],
      // Filtro del listado: "all" | "score" | "lyrics"
      listFilter: "all",
    };

    this.clickHandler = this.clickHandler.bind(this);
    this.setListFilter = this.setListFilter.bind(this);
    this.goHome = this.goHome.bind(this);
  } // end Constructor

  // Function to change page, updating the selected song
  clickHandler(id) {
    if (id > 0) {
      this.setState({
        actualId: id,
        actualSongObj: Constants.SONGS.find((s) => s.id === id),
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
    this.setState({
      actualId: 0,
      actualSongObj: Constants.SONGS[0],
      listFilter: "all",
    });
  }

  render() {
    const { listFilter, actualId, actualSongObj } = this.state;

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
          <aside className="main-sidebar">
            <Listado
              songs={Constants.SONGS}
              filter={listFilter}
              clickHandler={this.clickHandler}
              selectedSongId={actualId}
            />
          </aside>

          <main className="main-content-area">
            {/* En esta sección pintamos según el valor de actualId */}
            {actualId === 0 ? (
              <Introduction
                introductionText={
                  Constants.S_INTRODUCTION_TEXT
                }
              />
            ) : (
              <SongViewer
                song={actualSongObj}
                folder={Constants.SONGS_FOLDER}
              />
            )}
          </main>
        </section>

        <section className="section-footer">
          <Footer />
        </section>
      </div>
    ); // end return
  } // end render
} // end class App
