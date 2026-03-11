import React, {Component} from 'react';
import apiEmailjs from '../apis/apiEmailjs';
import emailjs from 'emailjs-com';


export default class Contact extends Component {
  constructor(props) {
    super(props);

    this.state = {
      submitted: false,
    };
    this.sendmail = this.sendmail.bind(this);
  } // end constructor

  sendmail =(e) => {
    e.preventDefault()

    emailjs.sendForm(apiEmailjs.SERVICE_ID, apiEmailjs.TEMPLATE_ID, e.target, apiEmailjs.USER_ID).then(
        result => {
            alert('Message sent correctly');
            this.setState({
              submitted: true,
            })
        },
        error => {
            alert( 'There was an error, try again')
            }
    )
} // end sendmail

  render() {
    if (this.state.submitted) {
      return <h1>Thanks for contacting us</h1>;
    } else {
      return (
        <section id="contact-form" className="container text-center">
          <h2>Contacto</h2>

          <form id="contact" className="container text-center" action="sendmail" method="post" onSubmit = {this.sendmail}>
            <label id="lb-from_name" for="from_name">Name: </label>
            <input id="input-from_name" type="text" name="from_name" required></input>

            <label id="lb-replay_to" for="replay_to">Email: </label>
            <input id="input-replay_to" type="email" name="replay_to" required></input>

            <label id="lb-msg" for="message">Your message: </label>
            <textarea id="tx-msg" type="text" name="message" required></textarea>

            <button id="btn-msg" type="submit">
              <i className="fa fa-envelope">Send</i>
            </button>
          </form>
        </section>
      );
    }
  } // end render
  
} // end Class Contact





     