import React, { useState } from "react";
import "./footer.css";
import musicImg from "../../../music.png";
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
    const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Implement your logic to handle form submission here
    // For example, sending data to a server-side API
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Feedback:', feedback);

    // Clear the form after submission (optional)
    setName('');
    setEmail('');
    setFeedback('');
  };

  return (
    <>
      <div className="footer-container">
        <div className="container"></div>
        <div className="networks-section">
        <div className="logo">
          <img src={musicImg} alt="" />
          <p>
            Music<span>GPT</span>{" "}
          </p>
        </div>
        <div className="find-me">
            <p>FOLLOW MY WORK</p>
            <ul className="network-links">
                <li className="network-link"><a href="https://github.com/OKBenzene02" target="_blank" ><GitHubIcon></GitHubIcon></a></li>
                <li className="network-link"><a href="https://www.linkedin.com/in/liyakhat-yousuf-mogal-54b506221/" target="_blank" ><LinkedInIcon></LinkedInIcon></a></li>
                <li className="network-link"><a href="https://www.facebook.com/liyakhatyousufmogal/" target="_blank" ><FacebookIcon></FacebookIcon></a> </li>
                <li className="network-link"><a href="https://www.instagram.com/liyakhat_yousuf/" target="_blank" ><InstagramIcon></InstagramIcon></a></li>
            </ul>
          </div>
        </div>
        <div className="contact-form">
        <h1 className="contact-form-heading">GOT ANYTHING TO <span>SAY!</span></h1>
            <img src="" alt="" />
        <form onSubmit={handleSubmit} >
      <label htmlFor="name">NAME</label>
      <input
        type="text"
        id="name"
        name="name"
        placeholder="Enter your name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <label htmlFor="email">EMAIL ADDRESS</label>
      <input
        type="email"
        id="email"
        name="email"
        placeholder="Enter your email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <label htmlFor="feedback">YOUR INSIGHTS</label>
      <textarea
        id="feedback"
        name="feedback"
        placeholder="Write your insights here..."
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
      />

      <button type="submit">SUBMIT</button>
    </form>
        </div>
      </div>
    </>
  );
};

export default Footer;
