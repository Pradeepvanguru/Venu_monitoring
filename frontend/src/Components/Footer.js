import React from "react";
import "./Footer.css";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa"; // Social Media Icons

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left Section - Company Info */}
        <div className="footer-section">
          <img src="/logo.png" alt="Company Logo" className="footer-logo" />
          <p>Your Company Name</p>
          <p>Building the future, one step at a time.</p>
        </div>

        {/* Middle Section - Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Right Section - Contact Info & Social Media */}
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Email: info@yourcompany.com</p>
          <p>Phone: +1 (234) 567-890</p>
          <p>Address: 123 Business Street, City, Country</p>
          
          {/* Social Media Icons */}
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          </div>
        </div>
      </div>

      {/* Bottom Section - Copyright */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Your Company Name. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
