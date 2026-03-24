import React, { Component } from "react";

export default class Introduction extends Component {
  render() {
    const mainImage = this.ExtractImage();

    return (
      <section id="main-content" className="container-fluid text-center">
        <h3>
          <i className="fa fa-home"></i> Introduction
        </h3>
        <article id="content">
          {this.props.introductionText.map((elem, i) => {
            return <p key={"main-content-parr-" + i}>{elem}</p>;
          })}

          {mainImage[0] && (
            <div id="main-img">
              <img
                id="main-image"
                className="img-responsive"
                src={mainImage[0]}
                alt={mainImage[1]}
                title={mainImage[1]}
                aria-labelledby="main-image-label"
              />
              <p id="main-image-label">{mainImage[1]}</p>
            </div>
          )}
        </article>
      </section>
    );
  } // end render

  ExtractImage() {
    // Si no se pasan props de imágenes, no mostramos imagen
    if (!this.props.photosNumber || !this.props.altImages) {
      return ["", ""];
    }

    const num = Math.floor(Math.random() * this.props.photosNumber) + 1;
    const imgUrl = "./images/villages/Alicante/Alicante (" + num + ").jpg";
    const altText = this.props.altImages[num] || "";

    return [imgUrl, altText];
  } // end ExtractImage
} // end class Introduction
