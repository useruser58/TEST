import React, { useState } from 'react';
import { Container, Form, Button } from "react-bootstrap";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import Swal from "sweetalert2";
import { loadingContent } from "./general/general-components";
import car from '../assets/images/car.png';

const ContactSection = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [contactData, setContactData] = useState({});

    const handleFormChange = e => {
        setContactData({
            ...contactData,
            [e.target.name]: e.target.value
        });
    };

    const handleContactSubmit = event => {
        event.preventDefault();
        setIsLoading(true);

        addDoc(collection(db, "contacts"), contactData)
            .then(() => {
                setIsLoading(false);
                Swal.fire({
                    title: "Bon travail!",
                    text: "Toutes les modifications enregistrées !",
                    icon: "success"
                });
            })
            .catch(err => {
                console.log(err);
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Quelque chose s'est mal passé!"
                });
            });
    };

    return (
        <section className="hero">
            <div className="hero-message">
                <h1 className='fs-2 fw-700'>Contactez-nous</h1>
            </div>
            <Form className="contact-form" onSubmit={handleContactSubmit}>
                <Form.Control type="text" name="name" placeholder="Nom" className="form-control" onChange={handleFormChange} required />
                <Form.Control type="email" name="email" placeholder="E-mail" className="form-control" onChange={handleFormChange} required />
                <Form.Control type="tel" name="phone" placeholder="Numéro de téléphone" className="form-control" onChange={handleFormChange} required />
                <Form.Control as="textarea" name="message" rows={3} placeholder="Message" className="form-control textarea-control" onChange={handleFormChange} required />
                <Button variant="dark" className="submit-btn" type="submit">Envoyer</Button>
            </Form>
            <picture className="promo-art">
                <img src={car} alt="Une voiture" />
            </picture>
        </section>
    );
};

export default ContactSection;
