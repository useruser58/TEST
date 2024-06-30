import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCarRear, faCreditCard, faUsers } from '@fortawesome/free-solid-svg-icons';
import HeroPages from './HeroPages';


function Features() {
  return (
    
    <section className="plan-section">

      <div className="container">
        <div className="plan-container">
          <div className="plan-container__title">
            <h2>Planifiez votre location maintenant</h2>
          </div>

          <div className="plan-container__boxes">
            <div className="plan-container__boxes__box">
              <FontAwesomeIcon icon={faCarRear} className="icon" style={{ fontSize: '2em' }} />
              <h3>Choisissez une voiture</h3>
              <p>
                Nous proposons une large gamme de véhicules pour tous vos besoins de conduite.
                Nous avons la voiture parfaite pour répondre à vos besoins.
              </p>
            </div>

            <div className="plan-container__boxes__box">
              <FontAwesomeIcon icon={faUsers} className="icon" style={{ fontSize: '2em' }} />
              <h3>Service Client Exceptionnel</h3>
              <p>
                La satisfaction de nos clients est notre priorité absolue.
                Notre équipe dévouée est disponible pour répondre à toutes vos questions et vous assister à chaque étape de votre location.
              </p>
            </div>

            <div className="plan-container__boxes__box">
              <FontAwesomeIcon icon={faCreditCard} className="icon" style={{ fontSize: '2em' }} />
              <h3>Tarifs Compétitifs et Transparence</h3>
              <p>
                La satisfaction de nos clients est notre priorité absolue.
                Notre équipe dévouée est disponible pour répondre à toutes vos questions et vous assister à chaque étape de votre location.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;
