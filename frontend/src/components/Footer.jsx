import React from "react";
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="banner">
          <div className="left">Kanishka</div>
          <div className="right">
            <p>Sadashiv Nagar ,belgaum</p>
            <p>Open: 05:00 PM - 12:00 AM</p>
          </div>
        </div>
        <div className="banner">
          <div className="left">
            <p>Developed By KANISHKA</p>
          </div>
          <div className="right">
            <p>All Rights Reserved By KANISHKANAIK.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;