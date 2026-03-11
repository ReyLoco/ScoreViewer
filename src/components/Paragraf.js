import React, { Component } from "react";

export default class Paragraf extends Component {

  render() {
    return (
      <div id="paragraf">
        <div id="lines">
          {this.props.text.map((elem, i) => {
            return (i===0) ? 
            <p key={"paragraf-" + i}><a href={this.props.url} target="_blank" rel="noopener noreferrer" >{this.props.village} </a> {elem} </p>
            :
            <p key={"paragraf-" + i}>{elem}</p>
            
          })}
        </div>
      </div>
    ); // end return
  } // end render
  
} // end class Paragraf


