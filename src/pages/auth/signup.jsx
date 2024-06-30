import React, { useState } from "react";
import useAuthentication from "../../hooks/useAuthentication";
import { NavLink, useNavigate } from "react-router-dom";
import { Alert, Button, Col, Container, Form, Row } from "react-bootstrap";
import { loadingContent } from "../../components/general/general-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";

const wilayas = [
    "Adrar",
    "Chlef",
    "Laghouat",
    "Oum El Bouaghi",
    "Batna",
    "Béjaïa",
    "Biskra",
    "Béchar",
    "Blida",
    "Bouira",
    "Tamanrasset",
    "Tébessa",
    "Tlemcen",
    "Tiaret",
    "Tizi Ouzou",
    "Alger",
    "Djelfa",
    "Jijel",
   " Sétif",
    "Saïda",
    "Skikda",
   " Sidi Bel Abbès",
    "Annaba",
    "Guelma",
    "Constantine",
    "Médéa",
    "Mostaganem",
   " M'Sila",
    "Mascara",
    "Ouargla",
    "Oran",
    "El Bayadh",
    "Illizi",
    "Bordj Bou Arréridj",
    "Boumerdès",
    "El Tarf",
    "Tindouf",
    "Tissemsilt",
   "El Oued",
   "Khenchela",
    "Souk Ahras",
    "Tipaza",
    "Mila",
    "Aïn Defla",
    "Naâma",
    "Aïn Témouchent",
    "Ghardaïa",
    "Relizane",
    "Timimoun",
    "Bordj Badji Mokhtar",
    "Ouled Djellal",
    "Béni Abbès",
    "In Salah",
    "In Guezzam",
    "Touggourt",
    "Djanet",
    "El M'Ghair",
    "El Meniaa"
];

const Signup = () => {
    const navigate = useNavigate();
    const { isLoading, message, signUpCall } = useAuthentication();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [birthDate, setBirthDate] = useState("");

    const [showAgeAlert, setShowAgeAlert] = useState(false);

    const [wilaya, setWilaya] = useState("");
    const [address, setAddress] = useState("");



    const [licenseNumber, setLicenseNumber] = useState("");
    const [licenseIssueDate, setLicenseIssueDate] = useState("");
    const [licenseExpiryDate, setLicenseExpiryDate] = useState("");
    const [showDateAlert, setShowDateAlert] = useState(false);


    const [licenseImage, setLicenseImage] = useState(null);



    const [passwordsMatch, setPasswordsMatch] = useState(true);

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setPasswordsMatch(false);
            return;
        }

        try {
            const signUp = await signUpCall({
                email,
                password,
                firstName,
                lastName,
                phone,
                birthDate,
                wilaya,
                address,
                licenseNumber,
                licenseIssueDate,
                licenseExpiryDate,
                licenseImage
            });

            if (signUp) {
                navigate('/login');
            }
        } catch (e) {
            console.error("Signup failed: ", e);
        }
    };


    const handleBirthDateChange = (e) => {
        const selectedDate = new Date(e.target.value);
        const today = new Date();
        const minimumBirthDate = new Date(today.getFullYear() - 22, today.getMonth(), today.getDate());

        if (selectedDate > minimumBirthDate) {
            setShowAgeAlert(true);
            return;
        } else {
            setShowAgeAlert(false);
        }

        setBirthDate(e.target.value);
    };




    const handleLicenseIssueDateChange = (e) => {
        const issueDate = new Date(e.target.value);
        const today = new Date();
        const threeYearsAgo = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());
        const nineYearsFromNow = new Date(today.getFullYear() + 10, today.getMonth(), today.getDate());
    
        if (issueDate < threeYearsAgo || issueDate > nineYearsFromNow) {
            alert("La date de délivrance doit être entre 3 ans et 10 ans avant aujourd'hui.");
            return;
        }
    
        setLicenseIssueDate(e.target.value);
    
        const expiryDate = new Date(issueDate.getFullYear() + 10, issueDate.getMonth(), issueDate.getDate());
        setLicenseExpiryDate(expiryDate.toISOString().split("T")[0]);
    };
    

    

    return (
        <div id="sign-up" className="signup-page">
            <Container className="d-flex align-items-center justify-content-center min-vh-100">
                <Row className="w-100">
                    <Col xs={12} md={8} lg={6} className="mx-auto">
                        <h1 className="text-center text-uppercase mb-4">créer un compte</h1>
                        {message !== null &&
                            (message.isError ? (
                                <Alert key="danger" variant="danger">
                                    {message.content}
                                </Alert>
                            ) : (
                                <Alert key="success" variant="success">
                                    {message.content}
                                </Alert>
                            ))}
                        <div className="card p-4 shadow-sm">
                            {isLoading ? (
                                <div className="text-center">{loadingContent}</div>
                            ) : (
                                <Form onSubmit={handleSignup}>
                                    <Row>
                                        <Col md={6}>
                                            
                                            <Form.Group className="mb-3" controlId="formBasicLastName">
                                                <Form.Label>Nom</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Nom de famille"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="formBasicFirstName">
                                                <Form.Label>Prénom</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Prénom"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="formBasicPhone">
                                                <Form.Label>Numéro de téléphone</Form.Label>
                                                <Form.Control
                                                    type="tel"
                                                    placeholder="Enter Phone Number"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                           
                                            {showAgeAlert && (
                <Alert variant="danger">
                    Vous devez avoir au moins 22 ans.
                </Alert>
            )}
            <Form.Group className="mb-3" controlId="formBasicBirthDate">
                <Form.Label>Date de naissance</Form.Label>
                <Form.Control
                    type="date"
                    value={birthDate}
                    onChange={handleBirthDateChange}
                    required
                />
            </Form.Group>




                                            <Form.Group className="mb-3" controlId="formBasicWilaya">
                                                <Form.Label>Wilaya</Form.Label>
                                                <Form.Control
                                                    as="select"
                                                    value={wilaya}
                                                    onChange={(e) => setWilaya(e.target.value)}
                                                    required
                                                >
                                                    <option value="">--Sélectionnez une wilaya--</option>
                                                    {wilayas.map((wilaya, index) => (
                                                        <option key={index} value={wilaya}>
                                                            {index + 1}. {wilaya}
                                                        </option>
                                                    ))}
                                                </Form.Control>
                                            </Form.Group>
                                            <Form.Group className="mb-3" controlId="formBasicAddress">
                                                <Form.Label>Addresse</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Adresse"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            
                                            <Form.Group className="mb-3" controlId="formBasicLicenseNumber">
                                                <Form.Label>Numéro de permis</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Numéro de permis"
                                                    value={licenseNumber}
                                                    onChange={(e) => setLicenseNumber(e.target.value)}
                                                    required
                                                />
                                            </Form.Group>


                                            <Form.Group className="mb-3" controlId="formBasicLicenseIssueDate">
                <Form.Label>Date de délivrance</Form.Label>
                <Form.Control
                    type="date"
                    value={licenseIssueDate}
                    onChange={handleLicenseIssueDateChange}
                    required
                />
            </Form.Group>



            <Form.Group className="mb-3" controlId="formBasicLicenseExpiryDate">
                <Form.Label>Date d'expiration</Form.Label>
                <Form.Control
                    type="date"
                    value={licenseExpiryDate}
                    readOnly
                />
            </Form.Group>


            <Form.Group className="mb-3" controlId="formBasicLicenseImage">
    <Form.Label>Image de permis</Form.Label>
    <Form.Control
        type="file"
        onChange={(e) => setLicenseImage(e.target.files[0])}
        required
    />
</Form.Group>




                                            <Row>
                                                <Col md={12}>
                                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                                        <Form.Label>Adresse email</Form.Label>
                                                        <div className="input-group">
                                                            <div className="input-group-prepend">
                                                                <span className="input-group-text"><FontAwesomeIcon icon={faEnvelope} /></span>
                                                            </div>
                                                            <Form.Control
                                                                type="email"
                                                                placeholder="Adresse email"
                                                                value={email}
                                                                onChange={(e) => setEmail(e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={12}>
                                                    <Form.Group className="mb-3" controlId="formBasicPassword">
                                                        <Form.Label>Mot de passe</Form.Label>
                                                        <div className="input-group">
                                                            <div className="input-group-prepend">
                                                                <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
                                                            </div>
                                                            <Form.Control
                                                                type="password"
                                                                placeholder="Mot de passe"
                                                                value={password} onChange={(e) => setPassword(e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={12}>
                                                    <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                                                        <Form.Label>Confirmer le mot de passe</Form.Label>
                                                        <div className="input-group">
                                                            <div className="input-group-prepend">
                                                                <span className="input-group-text"><FontAwesomeIcon icon={faLock} /></span>
                                                            </div>
                                                            <Form.Control
                                                                type="password"
                                                                placeholder="Confirmer le mot de passe"
                                                                value={confirmPassword}
                                                                onChange={(e) => {
                                                                    setConfirmPassword(e.target.value);
                                                                    setPasswordsMatch(e.target.value === password);
                                                                }}
                                                                required
                                                            />
                                                        </div>
                                                        {!passwordsMatch && (
                                                            <Form.Text className="text-danger">
                                                                Mots de passe ne sont pas identiques .
                                                            </Form.Text>
                                                        )}
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-100 btn-primary shadow-sm btn-sm"
                                    >
                                        Créer un compte
                                    </Button>
                                </Form>
                            )}
                        </div>
                        <div className="text-center mt-3">
                            <p>Vous avez déjà un compte ? <NavLink to="/login" className="text-blue">Connectez-vous!</NavLink></p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Signup;
