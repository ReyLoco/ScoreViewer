import React, { Component } from "react";

export default class GalleryImage extends Component {
  
  render() {
    return (
      <img onError={this.addDefaultSrc} className={this.props.className} alt={this.props.alt} src={this.props.src} />
    );
  } // end render

  addDefaultSrc(event){
    console.log('Falló la carga de', event.target.src);
    console.log(event.target)
  }
} // end Class GalleryImage
