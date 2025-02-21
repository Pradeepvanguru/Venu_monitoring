import React from 'react';
import './About.css';  // Import the stylesheet

const About = () => {
  return (
    <div className="about-container">
      <div className="about-overlay"></div> {/* Background effect */}
      <div className="about-content">
        <h1 className="about-title">About our Platform</h1>
        <p className="about-description">
          This project is built with a modern tech stack to provide scalable solutions.
          We use React, Node.js, MongoDB, and other advanced technologies to ensure a smooth,
          reliable user experience. We focus on delivering a secure and fast solution.
        </p>
        <p className="about-description">
          Our project involves user authentication, dynamic content management, and real-time
          data updates using REST APIs and WebSockets.
        </p>
        <div className="about-icons">
          <i className="fab fa-react"></i>
          <i className="fab fa-node-js"></i>
          <i className="fas fa-database"></i>
        </div>
      </div>
    </div>
  );
};

export default About;
