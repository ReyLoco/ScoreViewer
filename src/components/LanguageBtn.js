import React, { Component } from 'react';
import sIcon from "../assets/img/esp.png";
import eIcon from "../assets/img/eng.png";

export default class LanguageBtn extends Component {
  
  render() {
    return (
      <div id="button-lang">
        <button id="btn-esp">
          <img
            src={sIcon}
            title="español"
            alt="español"
            onClick={() => this.props.clickLanguage(false)}
          />
        </button>
        <button id="btn-eng">
          <img
            src={eIcon}
            title="english"
            alt="english"
            onClick={() => this.props.clickLanguage(true)}
          />
        </button>
      </div>
    );
  }
}

