import React, { Component } from "react";
import Paragraf from "./Paragraf";

export default class Footer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: ["Created By Luis Massó ~ 2021"],
    };
  } // end constructor

  render() {
    return (
      <div id="footer">
        <Paragraf text={this.state.text}></Paragraf>
      </div>
    ); // end return
  } // end render
  
} // end class Footer
