import React, { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import AboutImage from '../assets/images/about-image.png';
import {AnimatePresence, motion,useAnimation} from 'framer-motion/dist/framer-motion'
import { fadeIn } from '../variants'; 
import { useInView } from 'react-intersection-observer'; // Importer useInView pour détecter la visibilité



const AboutSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: false, // Permet de déclencher à chaque fois que l'élément entre dans la vue
    threshold: 0.5, // Se déclenche lorsque 50% de l'élément est visible
  });

  useEffect(() => {
    if (inView) {
      // Déclencher l'animation lorsque la section est visible dans la vue
      // Vous pouvez également réinitialiser l'animation ici si nécessaire
    }
  }, [inView]);

  return (
    <div id="about-section" className="vh-100" ref={ref}>
      <Container className="h-100">
        <Row className="h-100 align-items-center">
          <Col xs={{ span: 12, order: 'last' }} md={{ span: 6, order: 'first' }}>
            <motion.div
              variants={fadeIn('down', 0.5)}
              initial="hidden"
              animate={inView ? 'show' : 'hidden'} // Animation déclenchée lorsque inView est true
              className="image_iman"
              viewport={{ once: false, amount: 0.9 }}
            >
              <img src={AboutImage} className="about_img" alt="About" />
            </motion.div>
          </Col>
          <Col xs={{ span: 12, order: 'first' }} md={{ span: 6, order: 'last' }}>
            <motion.div
              variants={fadeIn('up', 0.5)}
              initial="hidden"
              animate={inView ? 'show' : 'hidden'} // Animation déclenchée lorsque inView est true
              className="mt-2 mb-5 text-center"
              viewport={{ once: false, amount: 0.9 }}
            >
              <h1 className="text-uppercase fs-1 fw-700">
              À <span className="primary-color">Propos</span>
              </h1>
              <p className="about-text fs-5 m-0 text-dark fw-400">
                Notre mission est de fournir une expérience de location de
                voitures sans tracas, où que vous alliez. Nous nous engageons à
                offrir un service client exceptionnel, des véhicules bien
                entretenus et des solutions de mobilité personnalisées pour
                répondre à vos besoins spécifiques.
              </p>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AboutSection;
