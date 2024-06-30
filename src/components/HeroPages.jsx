import React from 'react';
import { Link } from 'react-router-dom';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


function HeroPages({ name }) {
    return (
      <section className="hero-pages">
        <div className="hero-pages__overlay"></div>
        <div className="hero-pages__text">
          <h3>{name}</h3>
          <p>
            <Link to="/">
              <FontAwesomeIcon icon={faHome} /> Home
            </Link>{" "}
            / {name}
          </p>
        </div>
      </section>
    );
  }
  

export default HeroPages;
