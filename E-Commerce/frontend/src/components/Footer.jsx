import React from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      {/* Top Section */}
      <div className="footer-top">
        {/* Brand / About */}
        <div className="footer-section">
          <h2 className="footer-logo">My E-Commerce</h2>
          <p>
            Your one-stop shop for quality products at unbeatable prices.
            Discover thousands of items and enjoy fast delivery across India.
          </p>
        </div>

        {/* Shop Categories */}
        <div className="footer-section">
          <h3>Shop</h3>
          <ul>
            <li><a href="/products?category=electronics">Electronics</a></li>
            <li><a href="/products?category=fashion">Fashion</a></li>
            <li><a href="/products?category=home">Home & Living</a></li>
            <li><a href="/products?category=beauty">Beauty</a></li>
            <li><a href="/products?category=sports">Sports</a></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div className="footer-section">
          <h3>Customer Support</h3>
          <ul>
            <li><a href="/help">Help Center</a></li>
            <li><a href="/returns">Returns & Refunds</a></li>
            <li><a href="/shipping">Shipping Info</a></li>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/faqs">FAQs</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="footer-section">
          <h3>Join Our Newsletter</h3>
          <p>Get updates on new products and special offers.</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>

          {/* Social Links */}
          <div className="social-icons">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaLinkedin /></a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} My E-Commerce. All rights reserved.
        </p>
        <div className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/sitemap">Sitemap</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
