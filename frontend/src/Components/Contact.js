import React, { useState } from 'react';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just log the form data to the console
    console.log('Contact Form Submitted:', formData);
  };

  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      
      {/* Basic contact information */}
      <div className="contact-info">
        <h3>Reach Us At:</h3>
        <p><strong>Email:</strong>your email</p>
        <p><strong>Phone:</strong> (123) 456-7890</p>
        <p><strong>Address:</strong> Washington, D.C.
        Capital of the United States of America
       </p>
      </div>

      {/* Contact Form */}
      <div className="contact-form">
        <h3>Send Us a Message:</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Name:
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </label>

          <label>
            Email:
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </label>

          <label>
            Message:
            <textarea 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              required 
            />
          </label>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default Contact;
