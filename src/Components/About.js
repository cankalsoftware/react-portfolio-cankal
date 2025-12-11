import React, { useState } from "react";

const About = ({ data, onRefresh }) => {
  const [showFullBio, setShowFullBio] = useState(false);

  if (data) {
    var name = data.name;
    var profilepic = "images/" + data.image;
    var bio = data.bio;
    var street = data.address.street;
    var city = data.address.city;
    var state = data.address.state;
    var zip = data.address.zip;
    var phone = data.phone;
    var email = data.email;
    var resumeDownload = data.resumedownload;
  }

  const handlePrint = (e) => {
    e.preventDefault();
    window.print();
  };

  const getBioContent = () => {
    if (!bio) return null;
    if (showFullBio) return bio;
    // Truncate to ~300 chars or first few sentences
    const limit = 300;
    if (bio.length <= limit) return bio;
    return bio.substring(0, limit) + "...";
  };

  return (
    <section id="about">
      <div className="row">
        <div className="three columns">
          <img
            className="profile-pic"
            src={profilepic}
            alt="Profile Pic"
            onClick={onRefresh}
            style={{ cursor: 'pointer' }}
            title="Click to refresh data from CSVs"
          />
        </div>
        <div className="nine columns main-col">
          <h2>About Me</h2>

          <p>
            {getBioContent()}
            {bio && bio.length > 300 && (
              <span
                onClick={() => setShowFullBio(!showFullBio)}
                style={{ color: '#11ABB0', cursor: 'pointer', marginLeft: '10px' }}
              >
                {showFullBio ? "Read Less" : "Read More"}
              </span>
            )}
          </p>
          <div className="row">
            <div className="columns contact-details">
              <h2>Contact Details</h2>
              <p className="address">
                <span>{name}</span>
                <br />
                <span>
                  {street}
                  <br />
                  {city} {state}, {zip}
                </span>
                <br />
                <span>{phone}</span>
                <br />
                <span>{email}</span>
              </p>
            </div>
            <div className="columns download">
              <p>
                <a href="#" className="button" onClick={handlePrint}>
                  <i className="fa fa-download"></i>Download PDF
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
