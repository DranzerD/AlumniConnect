import React from "react";
import "./ContactUs.css";

const ContactUs = () => {
  return (
    <div className="contact-container">
      <h1 className="contact-title">Contact Us</h1>
      <p className="contact-description">
        Have questions or need assistance? Reach out to us using the form below.
      </p>
      <form className="contact-form">
        <label className="contact-label" htmlFor="name">
          Your Name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="contact-input"
          placeholder="Enter your name"
        />

        <label className="contact-label" htmlFor="email">
          Your Email:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="contact-input"
          placeholder="Enter your email"
        />

        <label className="contact-label" htmlFor="message">
          Message:
        </label>
        <textarea
          id="message"
          name="message"
          className="contact-textarea"
          placeholder="Type your message here"
        ></textarea>

        <button type="submit" className="contact-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default ContactUs;
