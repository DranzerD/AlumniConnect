import React from "react";
import "./Feedback.css";

const Feedback = () => {
  return (
    <div className="feedback-container">
      <h1 className="feedback-title">Feedback</h1>
      <p className="feedback-description">
        We value your feedback! Let us know how we can improve or what you loved about our service.
      </p>
      <form className="feedback-form">
        <label className="feedback-label" htmlFor="name">
          Your Name:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="feedback-input"
          placeholder="Enter your name"
        />

        <label className="feedback-label" htmlFor="email">
          Your Email:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="feedback-input"
          placeholder="Enter your email"
        />

        <label className="feedback-label" htmlFor="feedback">
          Your Feedback:
        </label>
        <textarea
          id="feedback"
          name="feedback"
          className="feedback-textarea"
          placeholder="Write your feedback here"
        ></textarea>

        <button type="submit" className="feedback-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Feedback;
