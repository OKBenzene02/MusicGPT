import React from "react";
import { Link, useLocation } from "react-router-dom";
import './navigation.css';
import WaveSound from './music-record.png'

const Navigation = () => {

    const location = useLocation(); // Get current location from React Router

  const isActive = (pathname) => {
    // Compare path names for active link highlighting
    return location.pathname === pathname;
  };

    return (
    <>
        <div className="gradient top-left"></div>
        <div className="navigation-container">
            <div className="combined-container">
            <div className="logo-container">
                <Link to='/'><img src={WaveSound} alt="waves" /></Link>
            </div>
            <ul className="navigation-items">
                <li className="navigation-content">
                    <Link to="/" className={`link-home ${isActive('/') ? 'active' : ''}`}>MAIN PAGE</Link>
                </li>
                <li className="navigation-content">
                    <Link to="/play" className={`link-play ${isActive('/play') ? 'active' : ''}`}>PLAY PIANO</Link>
                </li>
                <li className="navigation-content">
                    <Link to="/history" className={`link-history ${isActive('/history') ? 'active' : ''}`}>TRACKS HISTORY</Link>
                </li>
                <li className="navigation-content"> {/* Notice the typo correction here */}
                    <Link to="/contact" className={`link-contact ${isActive('/contact') ? 'active' : ''}`}>ABOUT ME</Link>
                </li>
            </ul>
            </div>
            <div className="additional-container">
                <button className="login">LOGIN</button>
                <button className="followme">FOLLOW ME</button>
            </div>
        </div>
        <div className="gradient top-right"></div>
    </>
    );
};

export default Navigation;