import React, { Component } from "react";

export default class Menu extends Component {
  
  render() {
    return (
      <div id="navbar">
        <ul>
          {this.props.menuOptions.map((option, i) => {
            return (
              <li key={option.id}>
                <a
                  id={"main-menuOption op-" + option.name}
                  className="white-text"
                  href="/#"
                  onClick={() => this.props.clickHandler(option.id)}
                  tabIndex={option.id === 100 ? this.props.menuOptions.length + 1 : option.id + 1}                  
                >
                  {option.name}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    ); // end return
  } // end render
} // end class Menu
