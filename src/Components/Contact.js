import React, { useState } from "react";

const Contact = ({ data }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState(""); // "", "sending", "success", "error"

  if (data) {
    var contactName = data.name;
    var street = data.address.street;
    var city = data.address.city;
    var state = data.address.state;
    var zip = data.address.zip;
    var phone = data.phone;
    var contactEmail = data.email;
    var contactMessage = data.contactmessage;
  }

  const submitForm = async (e) => {
    e.preventDefault();
    setStatus("sending");

    const formData = {
      name,
      email,
      subject,
      message,
    };

    try {
      // In production, this should point to the PHP file on the server.
      // If the React app is served from the same domain, /sendmail.php works.
      const response = await fetch("./sendmail.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.status === "success") {
        setStatus("success");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setStatus("error");
        alert("Failed to send message: " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("error");
      // Fallback to mailto if PHP fails (e.g. running locally without PHP)
      window.open(
        `mailto:${contactEmail}?subject=${encodeURIComponent(
          subject
        )}&body=${encodeURIComponent(name)} (${encodeURIComponent(
          email
        )}): ${encodeURIComponent(message)}`
      );
    }
  };

  return (
    <section id="contact">
      <div className="row section-head">
        <div className="two columns header-col">
          <h1>
            <span>Get In Touch.</span>
          </h1>
        </div>

        <div className="ten columns">
          <p className="lead">{contactMessage}</p>
        </div>
      </div>

      <div className="row">
        <div className="eight columns">
          <form onSubmit={submitForm}>
            <fieldset>
              <div>
                <label htmlFor="contactName">
                  Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  size="35"
                  id="contactName"
                  name="contactName"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="contactEmail">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  size="35"
                  id="contactEmail"
                  name="contactEmail"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="contactSubject">Subject</label>
                <input
                  type="text"
                  value={subject}
                  size="35"
                  id="contactSubject"
                  name="contactSubject"
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="contactMessage">
                  Message <span className="required">*</span>
                </label>
                <textarea
                  cols="50"
                  rows="15"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  id="contactMessage"
                  name="contactMessage"
                  required
                ></textarea>
              </div>

              <div>
                <button type="submit" className="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending..." : "Submit"}
                </button>
                <span id="image-loader" style={{ display: status === "sending" ? "inline-block" : "none" }}>
                  <img alt="" src="images/loader.gif" />
                </span>
              </div>
            </fieldset>
          </form>

          {status === "error" && (
            <div id="message-warning" style={{ display: "block" }}>
              Error sending message. Opening default mail client...
            </div>
          )}
          {status === "success" && (
            <div id="message-success" style={{ display: "block" }}>
              <i className="fa fa-check"></i>Your message was sent, thank you!
              <br />
            </div>
          )}
        </div>

        <aside className="four columns footer-widgets">
          <div className="widget widget_contact">
            <h4>Address and Phone</h4>
            <p className="address">
              {contactName}
              <br />
              {contactEmail}
              <br />
              <br />
              {street} <br />
              {city}, {state} {zip}
              <br />
              <span>{phone}</span>
            </p>
            <div className="widget widget_bmc">
              <h4 style={{ marginTop: '20px' }}>Support Me</h4>
              <p>
                <a href="https://buymeacoffee.com/alicankal" target="_blank" rel="noopener noreferrer" className="button" style={{ backgroundColor: '#FFDD00', color: '#000000', fontWeight: 'bold', width: '100%' }}>
                  <i className="fa fa-coffee" style={{ marginRight: '10px' }}></i>
                  Buy Me A Coffee
                </a>
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Contact;
