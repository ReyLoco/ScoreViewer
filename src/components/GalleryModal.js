import React, { Component } from "react";

export default class GalleryModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      src: this.props.src,
      topValue: this.CenterOfPhoto(this.props.src),
    };
  } // end constructor

  UNSAFE_componentWillReceiveProps(nextProps){
      if(nextProps.src !== '') {
          this.setState({
              src: nextProps.src,
              topValue: this.CenterOfPhoto(nextProps.src)
          })
      }
  }

  render() {
    if (this.props.isopen === false) {
      return null;
    }

    return (
      <div
        isopen={this.props.isopen.toString()}
        className="modal-overlay"
      >
        <div className="modal-body">
          <a className="modal-close" href="/#" onClick={this.props.closeModal} onKeyDown={this.props.onKeyDown}>
            <span className="fa fa-times" />
          </a>
          <img src={this.state.src} alt="" onClick={this.props.closeModal}/>

          <a className='card-arrow-left' href='/#' onClick={() => this.changeImage(this.props.imgUrls[this.props.imgUrls.indexOf(this.state.src)-1])} style={{top: this.state.topValue}}>
                <span className='fa fa-arrow-left' />
              </a>

              <a className='card-arrow-right' href='/#' onClick={() => this.changeImage(this.props.imgUrls[this.props.imgUrls.indexOf(this.state.src)+1])} style={{top: this.state.topValue}}>
                <span className='fa fa-arrow-right' />
              </a>    
        </div>
      </div>
    ); // end return
  } // end render

  changeImage = (url) => {
    if (url !== undefined) {
      this.setState({
        src: url,
        topValue: this.CenterOfPhoto(url),
      });
    }
  }; // end changeImage

  CenterOfPhoto(url) {
    return String(url).includes("_H") ? 300 : 400;
  } // end CenterOfPhoto

} // end Class GalleryModal
