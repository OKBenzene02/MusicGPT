import React from "react";
import './contact.css'
import UnderDevelopment from './programming.svg'

const Contact = () => {
    return (
        <>
            <div className="contact-me">
                <img src={UnderDevelopment} alt="page-developemnt" />
                <p>Page under <span>developement</span>{'⚒️'}</p>
            </div>
        </>
    );
}

export default Contact;