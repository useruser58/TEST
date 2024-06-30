// Import des dépendances
import React, { useEffect, useState } from 'react';
import { Button, Form, InputGroup } from "react-bootstrap";
import Swal from "sweetalert2";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { fetchLocations } from "../../hooks/useFetchData";
import { loadingContent } from "../../components/general/general-components";

const LocationsManager = () => {
    // Déclaration des états
    const [isLoading, setIsLoading] = useState(false);
    const [locations, setLocations] = useState(null);
    const [newLocation, setNewLocation] = useState("");

    // Effet pour récupérer les locations
    useEffect(() => {
        fetchLocations().then(response => setLocations(response));
    }, []);

    // Fonction pour gérer l'ajout d'une nouvelle location
    const handleAddNewButton = () => {
        if (!newLocation.trim().length) return;
        setLocations((prevState) => ({
            ...prevState,
            [Object.keys(prevState).length]: newLocation.toString(), // Convertir en chaîne de caractères
        }));
        setNewLocation("");
    }

    // Fonction pour gérer la suppression d'une location
    const handleRemoveButton = (key) => {
        const updatedLocations = { ...locations };
        delete updatedLocations[key];
        setLocations(updatedLocations);
    }

    // Fonction pour gérer le changement de valeur d'une location
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setLocations((prevState) => ({
            ...prevState,
            [name]: value.toString(), // Convertir en chaîne de caractères
        }));
    };

    // Fonction pour gérer la soumission du formulaire
    const handleSaveChangesSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        setDoc(doc(db, "vehicle", "locations"), locations)
            .then(() => {
                setIsLoading(false);
                Swal.fire({
                    title: "Good job!",
                    text: "All changes saved!",
                    icon: "success"
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

    // Rendu du composant
    return (
        <div>
            <h1>Locations Management</h1>
            <Form onSubmit={handleSaveChangesSubmit}>
                <div className="d-grid gap-2 p-3">
                    {
                        locations && !isLoading
                            ? <>
                                {/* Affichage des locations existantes */}
                                <h2>Edit Cities</h2>
                                {Object.entries(locations).map(([key, value]) =>
                                    <div key={key} className="my-2">
                                        <InputGroup>
                                            <Form.Control
                                                type="text"
                                                name={key}
                                                value={value || ''}
                                                onChange={handleInputChange}
                                                placeholder="Location..."
                                            />
                                            <Button variant="danger" type="button" onClick={() => handleRemoveButton(key)}>
                                                Remove
                                            </Button>
                                        </InputGroup>
                                    </div>
                                )}
                                {/* Ajout d'une nouvelle location */}
                                <div className="my-2">
                                    <h2>Add New City</h2>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            value={newLocation}
                                            onChange={e => setNewLocation(e.target.value)}
                                            placeholder="Location..."
                                        />
                                        <Button variant="primary" type="button" onClick={handleAddNewButton}>
                                            Add
                                        </Button>
                                    </InputGroup>
                                </div>
                                {/* Bouton de sauvegarde des modifications */}
                                <Button variant="success" type="submit">
                                    Save All Changes
                                </Button>
                            </>
                            : loadingContent
                    }
                </div>
            </Form>
        </div>
    );
};

export default LocationsManager;
