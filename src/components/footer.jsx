import React from 'react';
import {Container, Row, Col, Form, Button} from "react-bootstrap";
import {IoLocation} from "react-icons/io5";
import {BsTelephoneFill} from "react-icons/bs";
import {GrMail} from "react-icons/gr";
import {BiLogoFacebook, BiLogoLinkedin} from "react-icons/bi";
import {AiFillInstagram, AiOutlineTwitter} from "react-icons/ai";
import {useLocation} from "react-router-dom";


const Footer = () => {

  const location = useLocation();

  return <>
    {
        !location.pathname.includes("admin") &&
        <footer id="footer" className="p-3 mb-2 bg-dark text-white">
          <Container className="pt-3 pb-2">
            <Row>
              <Col>
                <h1 className="T-car fs-1 text-center fw-700">T-CAR Location</h1>
              </Col>
            </Row>
            <Row>
              <Col>
                <Row>
                  
                  <Col>
                    <h4 className="lv text-center fs-4 fw-600">Location Voiture</h4>
                    <p className="fs-6 text-center text-white m-0 mb-1">Nous proposons une large gamme des véhicules pour tous vos besoins de conduite. 
                     Nous avons la voiture parfaite pour répondre à vos besoins.</p>
                    

                  </Col>
                  <Col>   
                    <li className="lv fs-4 text-center fw-700">Liens</li>
                    <ul className="info fs-6 text-center m-0 mb-1">
                      <li> <a href="/" >Acceuil</a></li>
                      <li><a href="/about">À propos de Notre Page</a></li>
                      <li><a href="/vehicles " >Modèles de véhicules</a></li>
                      <li><a href="/contact" >Contactez-nous</a></li>   
                    </ul>         
                  </Col>                                 
                  <Col>
                    <h4 className="lv fs-4 fw-700">Contactez-nous</h4>
                    <p className="social-media fs-6 m-0">
                      <span>
                        <IoLocation/>&nbsp;
                        <a className="social-media" href="https://maps.app.goo.gl/6zSWStYX2okuEQ44A" target="_blank" >Sidi Bel-Abbes</a>
                      </span>
                      <br/>
                      <span>
                        <BsTelephoneFill size="0.9em"/>&nbsp;
                        <a className="social-media" href="tel:+12126583916" target="_blank">(+213) 561975173 </a>
                      </span>
                      <br/>
                      <span>
                        <GrMail />&nbsp;
                        <a className="social-media" href="mailto:info@gmail.com" target="_blank" >locationvoiture@gmail.com</a>
                      </span>
                    </p>
                    <div className="social-icon">
                      <ul>
                        <li><a href="https://www.facebook.com/" target="_blank"><BiLogoFacebook/></a></li>
                        <li><a href="https://twitter.com/" target="_blank"><AiOutlineTwitter/></a></li>
                        <li><a href="https://www.linkedin.com/" target="_blank"><BiLogoLinkedin/></a></li>
                        <li><a href="https://www.instagram.com/" target="_blank"><AiFillInstagram/></a></li>
                      </ul>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col>
                <p className="text-white text-center fs-6 mt-2 mb-1">
                © 2023/{new Date().getFullYear()} T-Car Location de voitures
                </p>
              </Col>
            </Row>
          </Container>
        </footer>
    }
    </>
};
export default Footer;