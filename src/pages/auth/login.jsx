import React, { useState } from 'react';
import useAuthentication from "../../hooks/useAuthentication";
import { NavLink, useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { loadingContent } from "../../components/general/general-components";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

const Login = () => {

    const navigate = useNavigate();
    const { isLoading, message, signInCall } = useAuthentication();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        await signInCall({ email, password });
    }

    return (
        <div id="login" className="login-page">
            <Container className="d-flex align-items-center justify-content-center min-vh-100">
                <Row className="w-100">
                    <Col xs={12} md={6} lg={4} className="mx-auto">
                        <h1 className="text-center text-uppercase mb-4">Page de connexion</h1>
                        <div className="text-center mt-3">
    <p>
        <button
            className="btn btn-link text-blue"
            onClick={() => {
                setEmail("admin@gmail.com");
                setPassword("aaaaaaa");
            }}
        >
            Cliquez ici pour remplir automatiquement les informations d'administration
        </button>
    </p>
    <p>
        <button
            className="btn btn-link text-blue"
            onClick={() => {
                setEmail("bobo@gmail.com");
                setPassword("aaaaaaa");
            }}
        >
            Cliquez ici pour remplir automatiquement les informations d'un utilisateur
        </button>
    </p>
</div>

                        {message !== null &&
                            (message.isError
                                ? <Alert key="danger" variant="danger">{message.content}</Alert>
                                : <Alert key="success" variant="success">{message.content}</Alert>)
                        }
                        <div className="card p-4 shadow-sm">
                            {isLoading
                                ? <div className="text-center">{loadingContent}</div>
                                : <Form onSubmit={handleLogin}>
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
    <Form.Label className="text-left">Adresse e-mail</Form.Label>
    <div className="input-group">
        <div className="input-group-prepend">
            <span className="input-group-text"><FontAwesomeIcon icon={faEnvelope} /></span>
        </div>
        <Form.Control
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
        />
    </div>
</Form.Group>
<Form.Group className="mb-3" controlId="formBasicPassword">
    <Form.Label className="text-left">Mot de passe</Form.Label>
    <div className="input-group">
        <div className="input-group-prepend">
            <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
        </div>
        <Form.Control
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
        />
    </div>
</Form.Group>

                                    
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-100 btn-primary shadow-sm"
                                    >
                                        Se connecter
                                    </Button>
                                </Form>
                            }
                        </div>
                        <div className="text-center mt-3">
                            <p>Vous n'avez pas encore de compte ? <NavLink to="/sign-up" className="text-blue">Inscrivez-vous!</NavLink></p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Login;
