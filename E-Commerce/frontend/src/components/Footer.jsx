import React from "react";

// ---------- Footer Component ----------
// Simple footer for the website
const Footer = () => (
  <footer
    style={{
      textAlign: "center",
      padding: "20px",
      marginTop: "50px",
      background: "#eee",
    }}
  >
    {/* Display current year dynamically */}
    &copy; {new Date().getFullYear()} My E-Commerce. All rights reserved.
  </footer>
);

export default Footer;
