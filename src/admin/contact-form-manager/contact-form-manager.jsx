import React, {useEffect, useState} from 'react';
import {Accordion, Button} from "react-bootstrap";
import {deleteDoc, doc} from "firebase/firestore";
import {db} from "../../config/firebase";
import Swal from "sweetalert2";

import {fetchContactForms} from "../../hooks/useFetchData";
import {loadingContent} from "../../components/general/general-components";

const ContactFormManager = () => {

    const [isLoading, setIsLoading] = useState(true);

    const [contactForms, setContactForms] = useState(null);

    useEffect(() => {

        fetchContactForms().then(response => {
            setContactForms(response);
            setIsLoading(false);
        });

    }, [])


    const handleDeleteMessage = async documentId => {

        Swal.fire({
            title: "Do you want to delete this message?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No"
        }).then((result) => {
            if (result.isConfirmed) {

                deleteDoc(doc(db, "contacts", documentId))
                    .then(() => {

                        Swal.fire(
                            'Message Deleted!',
                            'Selected message has been deleted!',
                            'success'
                        ).then((result) => {
                            if (result.isConfirmed) {
                                window.location.reload();
                            }
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "Something went wrong!"
                        });
                    });
            }
        });
    }

    return (
        <div>
            <h1>Messages du formulaire du contact</h1>
            <div className="d-grid gap-2 p-3">
                {
                    !isLoading
                        ?
                        contactForms
                            ?
                            <Accordion>
                                {
                                    Object.entries(contactForms).map(([key, value]) =>
                                        <Accordion.Item key={key} eventKey={key}>
                                            <Accordion.Header className="m-0 p-0">
                                                <h3 className="m-0 p-0">
                                                    <span>De: </span>
                                                    <span className="fw-600">{`${value.name} (${value.email}) (${value.phone})`}</span>
                                                </h3>
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <Accordion className="my-2">
                                                    <p className="fs-5">{value.message}</p>
                                                </Accordion>
                                                <div className="mt-2">
                                                    <Button variant="danger" className="w-100" type="button" onClick={() => handleDeleteMessage(value.id)}>Supprimer ce message</Button>
                                                </div>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    )
                                }
                            </Accordion>
                            :
                            <p>Aucun formulaire de contact n'a été envoyé par les utilisateurs</p>
                        :
                        loadingContent
                }
            </div>
        </div>
    );
};

export default ContactFormManager;