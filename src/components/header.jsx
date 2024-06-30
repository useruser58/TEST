import React from 'react';
import {useNavigate, Link, NavLink, useLocation} from "react-router-dom";
import {Container, Row, Nav, Navbar, Image, NavDropdown, Col, Button} from "react-bootstrap";
import {IoLocation} from "react-icons/io5";
import {LiaCarSideSolid} from "react-icons/lia";
import {BsTelephoneFill} from "react-icons/bs";
import {GrMail} from "react-icons/gr";
import {useSelector} from "react-redux";
import {FaUserPlus} from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket, faUser } from '@fortawesome/free-solid-svg-icons'; 
import { isAdmin } from "../config/general";
import logo from '../assets/images/Imagelogo.png';
import useAuthentication from "../hooks/useAuthentication";

const Header = () => {
    const location = useLocation();
    const user = useSelector(({UserSlice}) => UserSlice.user);
    const {signOutCall} = useAuthentication();

    const handleLogout = async () => {
        await signOutCall();
    }

    return (
        <>
            {!location.pathname.includes("admin") && (
                <header id="header">
                    <Navbar bg="light" data-bs-theme="light" collapseOnSelect expand="lg" className="navbar1">
                        <Container>
                            <Navbar.Brand as={Link} to="/">
                                <Image src={logo} width="170" height="170" alt="logo" />
                            </Navbar.Brand>
                            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                            <Navbar.Collapse id="responsive-navbar-nav">
                                <Nav className="mr-auto fw-700">
                                    <Nav.Link as={Link} to="/">Acceuil</Nav.Link>
                                    <Nav.Link as={Link} to="/about">À propos</Nav.Link>
                                    <Nav.Link as={Link} to="/services">Services</Nav.Link>
                                    <Nav.Link as={Link} to="/vehicles">Véhicules</Nav.Link>
                                    <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
                                </Nav>
                                <Nav>
                                    {user.email ? (
                                        <>
                                            {isAdmin(user.role) ? (
                                                <Nav.Link as={Link} to="/admin" eventKey="i" className="fw-bold">
                                                    <FontAwesomeIcon icon={faUser} /> Panneau Admin
                                                </Nav.Link>
                                            ) : (
                                                <Nav.Link as={Link} to="/my-rentals" eventKey="i">
                                                    Mes Réservations <LiaCarSideSolid size="1.25em" className="align-text-top" />
                                                </Nav.Link>
                                            )}
                                            <Button variant="danger" className="py-0" onClick={handleLogout} eventKey="i">
                                                Déconnecter &nbsp;
                                                <FontAwesomeIcon icon={faRightToBracket} />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Nav.Link as={Link} to="/sign-up" className="d-inline px-0-md fw-bold" eventKey="i">
                                                Créer un compte <FaUserPlus size="1.5em" className="align-text-top" />
                                            </Nav.Link>
                                            <Link to="/login">
                                                <Button variant="primary rent-now-button primary-bg-color border-0 rounded-1 px-4 fw-bold">
                                                    Se connecter
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>

                    <Container fluid className="header-line-2 py-md-2 text-white fs-5">
                        <Row className="justify-content-md-center text-center">
                            <Col xs={12} md={10}>
                                <Row>
                                    <Col xs={12} md={4}>
                                        <span className="fs-6">
                                            <IoLocation className="header-line-2-icon" />&nbsp;
                                            <a href="https://maps.app.goo.gl/6zSWStYX2okuEQ44A" target="_blank" className="text-white">Sidi Bel-Abbes</a>
                                        </span>
                                    </Col>
                                    <Col xs={12} md={4}>
                                        <span className="fs-6">
                                            <BsTelephoneFill size="0.9em" className="header-line-2-icon" />&nbsp;
                                            <a href="tel:+12126583916" target="_blank" className="text-white">(+213) 561975173</a>
                                        </span>
                                    </Col>
                                    <Col xs={12} md={4}>
                                        <span className="fs-6">
                                            <GrMail className="header-line-2-icon" />&nbsp;
                                            <a href="mailto:info@rentacar" target="_blank" className="text-white">locationvoituresba22@gmail.com</a>
                                        </span>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Container>
                </header>
            )}
        </>
    );
};

export default Header;
