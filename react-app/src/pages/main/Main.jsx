import React, { useState } from "react";

import creativity from './creativity.png'
import storyset from "./Playing Music-cuate.svg";
import arrowRight from './arrow-right.svg'
import Content1 from './content-1.png'
import Content2 from './content-2.png'
import "./main.css";

const Main = () => {


  return (
    <>
      <div className="main-container">
        <div className="left-container">
          <span className="tagline">POWERED BY GENERATIVE AI</span>
          <p className="heading">
            Music<span>GPT</span>
          </p>
          <p className="description-heading">
            Harmonize Your
            <span><img src={creativity} alt="creativity" /></span>
          </p>
          <p className="description-tagline">
            Explore Infinite Melodies with our <span>AI Music Generation</span>{" "}Project!
          </p>
          <a className="learn-more" href="#scroll-container-1">LEARN MORE <img src={arrowRight} /></a>
        </div>
        <div className="right-container">
          <img src={storyset} alt="" />
          <div className="dialogue first" >
              <span className="caption1">
                Where Artificial Intelligence Crafts the Symphony of Tomorrow
              </span>
          </div>
          <div className="dialogue second">
              <span className="caption2">
                Experience the Future of Music: Creativity Meets AI Innovation
              </span>
          </div>
        </div>
        <div className="behind"></div>
      </div>
      <div id="scroll-container-1" className="scroll-container-1">
        <div className="vertical-container">
          <div className="vertical-div1"></div>
          <div className="box"></div>
          <div className="vertical-div2"></div>
          </div>
        <div className="content">
          <div className="heading">Transformers Based Architectures</div>
          <div className="image"><img src={Content1} alt="image" /></div>
        </div>
      </div>
      <div className="scroll-container-2">
      <div className="content">
          <div className="heading">Wide-variety of Tool Kits and open source contribution</div>
          <div className="image"><img src={Content2} alt="image" /></div>
        </div>
        <div className="vertical-container">
          <div className="vertical-div1"></div>
          <div className="box"></div>
          <div className="vertical-div2"></div>
        </div>
      </div> 
    </>
  );
};

export default Main;
