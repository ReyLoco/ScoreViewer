import React, { Component } from "react";
import logo from "../assets/img/logo.jpg";

export default class Header extends Component {
  
  render() {
    return (
      <header id="header">        
        <div className="row">
          <div className="cols-xs-4">
            <img id="logo" className="img-responsive img-fluid" src={logo} alt="logo" />
          </div>
          <div className="cols-xs-4">
            <h1 id="titulo" className="text-center white-text">{this.props.title}</h1>
            <h2 id="slogan" className="text-center white-text">{this.props.slogan}</h2>
          </div>
        </div>
        
      </header>
    ); // end return
  } // end render
} // end class Header
