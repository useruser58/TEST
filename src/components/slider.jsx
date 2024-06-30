import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import ourcar from "../assets/images/ourcar.jpg";
import Typewriter from 'typewriter-effect';
import {AnimatePresence, motion} from 'framer-motion/dist/framer-motion'
import { fadeIn } from '../variants'; 

const Hero = () => {
  const [goUp, setGoUp] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const bookBtn = () => {
    document.querySelector("#booking-section").scrollIntoView({ behavior: "smooth" });
  };

  const aboutBtn = () => {
    document.querySelector("#about").scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const onPageScroll = () => {
      if (window.pageYOffset > 600) {
        setGoUp(true);
      } else {
        setGoUp(false);
      }
    };

    window.addEventListener("scroll", onPageScroll);

    return () => {
      window.removeEventListener("scroll", onPageScroll);
    };
  }, []);

  return (
    <section id="home" className="hero-section">
      <div className="hero-background">
        {/* Image de fond floue */}
        <img src={ourcar} alt="car-img" className="hero-background__image" />
      </div>
      <Container>
      <motion.div
          variant={fadeIn('down', 0.9)} // Utilisez `variants` au lieu de `variant`
          initial="hidden"
          animate="show"
         viewport={{once:false,amount:0.9}}
          className="hero-content"
         >
          <div className="hero-content__text">
            <div style={{ color:"#ffffff", fontSize: "3.5rem", fontWeight: "bold" }}>
              <Typewriter
                options={{
                  strings: ['T-Car : Louez , Partez, Profitez'],
                  autoStart: true,
                  loop: true,
                  delay: 40,
                }}
              />
            </div>
            <p>T-Car propose les meilleures offres de location de voiture en Algérie .Indiquez vos critères de recherche dans le formulaire en bas de page</p>
            <div className="hero-content__text__btns">
              <Link onClick={bookBtn} className="hero-content__text__btns__book-ride" to="/vehicles">
                Réserver &nbsp; <i className="fa-solid fa-circle-check"></i>
              </Link>
            </div>
          </div>
        </motion.div>
      </Container>
      {/* Flèche de retour en haut */}
      <div onClick={scrollToTop} className={`scroll-up ${goUp ? "show-scroll" : ""}`}>
        <i className="fa-solid fa-angle-up"></i>
      </div>
    </section>
  );
}

export default Hero;
