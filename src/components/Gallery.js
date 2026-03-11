import React, { Component } from "react";
import GalleryImage from "./GalleryImage.js";
import GalleryModal from "./GalleryModal.js";
import Paragraf from "./Paragraf.js";

export default class Gallery extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      url: "",
      totalImg: this.props.imgUrls.length,
      english: this.props.english,
      menuOpCount: this.props.menuOpCount,
      firstImg: this.props.menuOpCount + 1,
      lastImg: this.props.imgUrls.length + this.props.menuOpCount,
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.onKeyPressHandler = this.onKeyPressHandler.bind(this);
  } // end constructor

  render() {
    return (
      <section id="main-content" refs="gallery-container" className="container-fluid gallery-container">
        <h3>{this.props.village.name}</h3>

        <article>
          <Paragraf text={(this.props.english)?this.props.village.itext : this.props.village.stext} 
                    village={this.props.village.name} 
                    url={(this.props.english)?this.props.village.iurl : this.props.village.surl}>
          </Paragraf>
        </article>

        <div className="row">
          {this.props.imgUrls.map((url, index) => {
            return (
              <div key={"divcol" + index} className="gallery-card col-lg-2 col-md-4 col-sm-6 col-xs-12">
                <GalleryImage key={"gal" + index} className="gallery-thumbnail img-fluid img-thumbnail" src={url} alt={"Image of " + this.props.village.name + " " + (index + 1)} />

                <span
                  id={index + this.state.menuOpCount}
                  key={"span" + index}
                  className="card-icon-open fa fa-arrows-alt"
                  value={url}
                  onClick={(e) => this.openModal(url)}
                  onKeyDown={(e) => this.onKeyPressHandler(e, url, index + this.state.menuOpCount)}
                  tabIndex={index + this.state.menuOpCount}
                />
              </div>
            );
          })}
        </div>
        <GalleryModal isopen={this.state.showModal} src={this.state.url} closeModal={this.closeModal} onKeyDown={(e) => this.onKeyPressHandler(e, this.state.url)} imgUrls={this.props.imgUrls} />
      </section>
    ); // end return
  } // end render

  // Function to open the photograf on modal when arrow icons is clicked
  openModal = (url) => {
    this.setState({
      url: url,
      showModal: true,
    });
  }; // end openModal

  // Function to close the modal image form
  closeModal = () => {
    this.setState({
      url: "",
      showModal: false,
    });
  }; // end closeModal

  // Function to set focus on image depending on with keyboard key is pressed.
  onKeyPressHandler(e, url, id) {
    console.log(id);
    console.log(e.keyCode);
    e.preventDefault();
    switch (e.keyCode) {
      case 13: //Enter
        this.openModal(url);
        break;
      case 27: // Escape
        this.closeModal();
        this.nextFocus(id);
        break;
      case 9: // Tab button
      case 39: // Right arrow
        this.nextFocus(id);
        break;
      case 37: // Left arrow
        this.previousFocus(id);
        break;
      case 40: // down arrow
        this.donwImgFocus(id);
        break;
      case 38: // up arrow
        this.upImgFocus(id);
        break;
      default:
        // do nothing;
        break;
    }
  }

  // Función to set focus in next image
  nextFocus(idElement) {
    if (idElement === this.state.lastImg) {
      idElement = this.state.lastImg;
    }
    document.getElementById(idElement + 1).focus();
  }

  // Function to set focus in previous image
  previousFocus(idElement) {
    if (idElement === 1) {
      idElement = 1;
    }
    document.getElementById(idElement - 1).focus();
  }

  // Function to set focus in down image
  donwImgFocus(idElement) {
    if (idElement >= this.state.lastImg - 6) {
      document.getElementById(idElement).focus();
    } else {
      document.getElementById(idElement + 6).focus();
    }
  }

  // Function to set focus in up image
  upImgFocus(idElement) {
    if (idElement < 6) {
      document.getElementById(idElement).focus();
    } else {
      document.getElementById(idElement - 6).focus();
    }
  }
} // end Class Gallery
