import React from "react";
import { Link } from "react-router-dom";
import { HiOutlineArrowRight } from "react-icons/hi";

const About = () => {
  return (
    <>
      <section className="about" id="about">
        <div className="container">
          <div className="banner">
            <div className="top">
              <h1 className="heading">ABOUT US</h1>
              <p>The only thing we're serious about is food.</p>
            </div>
            <p className="mid">
              At Aurora Bistro, flavor meets artistry in every dish. Nestled in 
              the heart of the city, it blends rustic charm with modern elegance. 
              Our chefs craft each plate with passion, using locally sourced ingredients 
              and bold global spices. From wood-fired pizzas to creamy pastas and 
              sizzling grills, every bite tells a story of freshness and creativity.
               Soft lights, warm smiles, and the aroma of baked bread fill the air, 
               making each visit feel like home. Whether you come for a quiet dinner
                or a lively celebration, Aurora promises an experience that lingers
                 long after the last bite.
            </p>
            <Link to={"/"}>
              Explore Menu{" "}
              <span>
                <HiOutlineArrowRight />
              </span>
            </Link>
          </div>
          <div className="banner">
            <img src="about.png" alt="about" />
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
