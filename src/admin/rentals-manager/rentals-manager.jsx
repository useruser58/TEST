import React, { useState, useEffect } from 'react';
import { Accordion, Button, Card, Col, Form, InputGroup, ListGroup, Row } from "react-bootstrap";
import { fetchCars, fetchLocations, fetchReservations } from "../../hooks/useFetchData";
import { loadingContent } from "../../components/general/general-components";
import { BsCarFront, BsFillCarFrontFill, BsFillFuelPumpFill } from "react-icons/bs";
import { TbEngine, TbManualGearbox } from "react-icons/tb";
import { PiEngineFill } from "react-icons/pi";
import { doc, getDocs, deleteDoc, query, collection, where, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import Swal from "sweetalert2";

const RentalsManager = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [cars, setCars] = useState(null);
  const [locations, setLocations] = useState(null);
  const [reservations, setReservations] = useState(null);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();
    console.log('Search query:', searchQuery);
  
    if (!searchQuery.trim()) {
      setSearchResults(reservations);
      return;
    }
  
    const filteredReservations = Object.entries(reservations).reduce((acc, [groupKey, reserveGroup]) => {
      const matchingReservations = reserveGroup.filter(reserveData => {
        const { nom, prenom } = reserveData;
        return nom.toLowerCase().includes(searchQuery.toLowerCase()) || prenom.toLowerCase().includes(searchQuery.toLowerCase());
      });
  
      if (matchingReservations.length > 0) {
        acc[groupKey] = matchingReservations;
      }
  
      return acc;
    }, {});
  
    console.log('Search results:', filteredReservations);
    setSearchResults(filteredReservations);
  };
  






  useEffect(() => {
    Promise.all([fetchCars(), fetchLocations(), fetchReservations()])
      .then(responses => {
        setCars(responses[0]);
        setLocations(responses[1]);
        const groupedReservations = groupReservationsWithSameOwner(responses[2]);
        setReservations(groupedReservations);
        setSearchResults(groupedReservations);  // Initialisation de searchResults avec toutes les réservations
        console.log('Reservations:', groupedReservations);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
  }, []);
  

  const calculateNewTotalPrice = (carId, startDate, endDate) => {
    // Supposons que le prix de location de la voiture dépende du type de voiture et de la durée de location
    // Vous devrez écrire la logique en fonction de vos propres critères de tarification
    let pricePerDay = cars[carId].price; // Déclaration et initialisation de la variable pricePerDay

    // Obtenez les détails de la voiture à partir de l'ID de la voiture
    const carDetails = cars[carId];

    // Calculez le nombre de jours de location
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const timeDifference = endDateObj.getTime() - startDateObj.getTime();
    const numberOfDays = Math.ceil(timeDifference / (1000 * 3600 * 24)); // Convertit la différence en jours arrondis à l'entier supérieur

    // Calculez le nouveau prix total
    const totalPrice = pricePerDay * numberOfDays;

    return totalPrice;
  };

  const handleModifyReservation = async (documentId) => {
    // Récupérer la réservation existante à partir de la base de données Firebase
    const reservationRef = doc(db, "rentals", documentId);
    const reservationDoc = await getDoc(reservationRef);

    if (reservationDoc.exists()) {
      const reservationData = reservationDoc.data();

      // Calculer le nouveau prix en fonction des nouvelles dates
      // Mettez ici votre logique pour calculer le nouveau prix en fonction des nouvelles dates
      const newTotalPrice = calculateNewTotalPrice(reservationData.carId, newStartDate, newEndDate);

      // Mettre à jour les champs de dates dans la réservation avec les nouvelles valeurs
      const updatedReservationData = {
       ...reservationData,
        startDate: newStartDate,
        endDate: reservationData.endDate, // Utilisez l'ancienne endDate
        newStartDate: newStartDate, // Sauvegardez la nouvelle newStartDate
        newEndDate: newEndDate, // Sauvegardez la nouvelle newEndDate
        totalPrice: newTotalPrice // Mettez à jour le champ de prix avec le nouveau prix calculé
      };

      // Envoyer la réservation mise à jour à la base de données Firebase
      await updateDoc(reservationRef, updatedReservationData);

      // Affichez un message de succès ou effectuez toute autre action nécessaire
      Swal.fire(
        'Reservation Updated!',
        'Selected reservation has been updated successfully!',
        'success'
      ).then((result) => {
        if (result.isConfirmed) {
          window.location.reload();
        }
      });
    } else {
      // La réservation n'existe pas, affichez un message d'erreur ou effectuez une autre action nécessaire
      console.error("Reservation not found!");
    }
  }

  const groupReservationsWithSameOwner = (allReservations) => {
    return allReservations.reduce((acc, curr) => {
      let key = curr["reservationOwner"]
      if (!acc[key]) acc[key] = []

      acc[key].push(curr)

      return acc
    }, {});
  }

  useEffect(() => {
    Promise.all([
      fetchCars(),
      fetchLocations(),
      fetchReservations(),
    ])
     .then(responses => {
        setCars(responses[0])
        setLocations(responses[1])
        setReservations(responses[2]? groupReservationsWithSameOwner(responses[2]) : responses[2])

        setIsLoading(false);
      });
  }, []);

  const handleCancelAllReservations = () => {
  }
  const handleCancelUserReservations = async (owner) => {
    Swal.fire({
      title: "Do you want to cancel all reservation of this user?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, cancel all!",
      cancelButtonText: "No"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const q = query(collection(db, "rentals"), where("reservationOwner", "==", owner));
        const querySnapshot = await getDocs(q);

        Promise.all(querySnapshot.docs.map(async (doc) => {
          await deleteDoc(doc.ref)
        }))
         .then(() => {
            Swal.fire(
              `User's All Reservations Cancelled!`,
              `Reservations has been removed!`,
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
          });;
      }
    });
  }

  const handleCancelSpecificReservation = async documentId => {
    Swal.fire({
      title: "Do you want to cancel this reservation?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No"
    }).then((result) => {
      if (result.isConfirmed) {
        deleteDoc(doc(db, "rentals", documentId))
         .then(() => {
            Swal.fire(
              'Reservation Cancelled!',
              'Selected car has been removed!',
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
      <h1>Gérér les réservations</h1>
      <div className="d-grid gap-2 p-3">
        <form onSubmit={handleSearch}>
          <InputGroup size="lg" className="my-2">
            <InputGroup.Text id="search">Rechercher par nom ou prénom</InputGroup.Text>
            <Form.Control
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher"
            />
            <Button variant="primary" type="submit">
              Rechercher
            </Button>
          </InputGroup>
        </form>
        {
         !isLoading
           ? searchResults
             ? (
                <Accordion>
                  {
                    Object.entries(searchResults).map(([groupKey, reserveGroup], index) => {
                      const { nom, prenom, telephone, wilaya, birthDate, permis } = reserveGroup[0]; // Supposons que chaque groupea les mêmes nom et prénom pour l'utilisateur
                      return (
                        <Accordion.Item key={index} eventKey={index}>
                          <Accordion.Header className="m-0 p-0">
                            <h3 className="m-0 p-0">
                              <span>email: </span>
                              <span className="fw-600">{groupKey}</span>
                              <br/>
                              <span>Nom: </span>
                              <span className="fw-600"> {nom}</span>
                              <br/>
                              <span>Prénom: </span>
                              <span className="fw-600"> {prenom}</span>
                              <br/>
                              <span>Date naissance: </span>
                              <span className="fw-600"> {birthDate}</span>
                              <br/>
                              <span>Téléphone: </span>
                              <span className="fw-600"> {telephone}</span>
                              <br/>
                              <span>Wilaya : </span>
                              <span className="fw-600"> {wilaya}</span>
                              <br/>
                              <span>Numéro permis : </span>
                              <span className="fw-600"> {permis}</span>
                              <br/>
                            </h3>
                          </Accordion.Header>
                          <Accordion.Body>
                            <Accordion className="my-2">
                              {
                                reserveGroup.map((reserveData, idx) => (
                                  <Accordion.Item key={idx} eventKey={idx}>
                                    <Accordion.Header className="m-0 p-0">
                                      <h3 className="m-0 p-0">
                                        <BsFillCarFrontFill size="2em" className="me-2" style={{ marginTop: "-10px" }} />
                                        <span className="fs-5 fw-bold">{`${reserveData.carBrand} / ${reserveData.carModel}`}</span>
                                      </h3>
                                    </Accordion.Header>
                                    <Accordion.Body>
                                      <Col xs={12}>
                                        <Row>
                                          <Col xs={12} md={6}>
                                            <img src={cars && cars[reserveData.carId] ? cars[reserveData.carId].image : ''} alt={`${reserveData.carBrand} / ${reserveData.carModel}`} />
                                          </Col>
                                          <Col xs={12} md={6}>
                                            <ListGroup variant="flush">
                                              <ListGroup.Item>
                                                <TbEngine size="2em" className="me-2" style={{ marginTop: "-8px" }} />
                                                <span className="fs-6">Puissance</span> &nbsp;
                                                <span className="fs-5 fw-bold">{cars && cars[reserveData.carId] ? cars[reserveData.carId].power : 'N/A'}</span>
                                              </ListGroup.Item>
                                              <ListGroup.Item>
                                                <PiEngineFill size="2em" className="me-2" style={{ marginTop: "-8px" }} />
                                                <span className="fs-6">Moteur</span> &nbsp;
                                                <span className="fs-5 fw-bold">{cars && cars[reserveData.carId] ? cars[reserveData.carId].engineSize : 'N/A'}</span>
                                              </ListGroup.Item>
                                              <ListGroup.Item>
                                                <TbManualGearbox size="2em" className="me-2" style={{ marginTop: "-8px" }} />
                                                <span className="fs-6">Boite vitesse</span> &nbsp;
                                                <span className="fs-5 fw-bold">{cars && cars[reserveData.carId] ?cars[reserveData.carId].gearbox : 'N/A'}</span>
                                              </ListGroup.Item>
                                              <ListGroup.Item>
                                                <BsCarFront size="2em" className="me-2" style={{ marginTop: "-10px" }} />
                                                <span className="fs-6">Type</span> &nbsp;
                                                <span className="fs-5 fw-bold">{cars && cars[reserveData.carId] ? cars[reserveData.carId].bodyType : 'N/A'}</span>
                                              </ListGroup.Item>
                                              <ListGroup.Item>
                                                <BsFillFuelPumpFill size="2em" className="me-2" style={{ marginTop: "-10px" }} />
                                                <span className="fs-6">Carburant</span> &nbsp;
                                                <span className="fs-5 fw-bold">{cars && cars[reserveData.carId] ? cars[reserveData.carId].fuelType : 'N/A'}</span>
                                              </ListGroup.Item>
                                              <ListGroup.Item>
                                                <span className="fs-6">Prix total</span> &nbsp;
                                                <span className="fs-5 fw-bold">{reserveData.totalPrice}</span>
                                              </ListGroup.Item>
                                              <ListGroup.Item>
                                                <span className="fs-6">Méthode de paiment</span> &nbsp;
                                                <span className="fs-5 fw-bold">{reserveData.paymentMethod}</span>
                                              </ListGroup.Item>
                                            </ListGroup>
                                          </Col>
                                        </Row>
                                        <Row>
                                          <Col>
                                            <Row>
                                              <Col xs={12} md={6}>
                                                <InputGroup size="lg" className="my-2">
                                                  <InputGroup.Text id="pick-up-locations">Lieu de départ</InputGroup.Text>
                                                  <Form.Select size="lg" disabled>
                                                    <option value={reserveData.pickupLocation}>{locations[reserveData.pickupLocation]}</option>
                                                  </Form.Select>
                                                </InputGroup>
                                              </Col>
                                              <Col xs={12} md={6}>
                                                <InputGroup size="lg" className="my-2">
                                                  <InputGroup.Text id="start-date">Date de départ</InputGroup.Text>
                                                  <Form.Control
                                                    type="date"
                                                    min={reserveData.startDate}
                                                    value={reserveData.startDate}
                                                    disabled
                                                  />
                                                </InputGroup>
                                              </Col>
                                            </Row>
                                            <Row>
                                              <Col xs={12} md={6}>
                                                <InputGroup size="lg" className="my-2">
                                                  <InputGroup.Text id="drop-off-locations">Lieu de dépot</InputGroup.Text>
                                                  <Form.Select size="lg" disabled>
                                                    <option value={reserveData.dropoffLocation} >{locations[reserveData.dropoffLocation]}</option>
                                                  </Form.Select>
                                                </InputGroup>
                                              </Col>
                                              <Col xs={12} md={6}>
                                                <InputGroup size="lg" className="my-2">
                                                                    <InputGroup.Text id="end-date">Date de dépot</InputGroup.Text>
                                                                              <Form.Control
                                                                                 type="date"
                                                                                     min={reserveData.endDate}
                                                                           value={reserveData.endDate}
                                                                           disabled
                                                                      />
                                                                                    </InputGroup>
                                                                                   <InputGroup size="lg" className="my-2">
                                                                                <InputGroup.Text id="end-date">Nouvelle Date de dépot</InputGroup.Text>
                                                                                  <Form.Control
                                                                                      type="date"
                                                                                        min={reserveData.newEndDate}
                                                                                       value={reserveData.newEndDate}
                                                                                        disabled
                                                                                            />
                                                                                        </InputGroup>

                                                                                        </Col>
                                            </Row>
                                          </Col>
                                        </Row>
                                        <Row>
                                          <Col>
                                            <Button variant="danger" className="w-100" type="button"
                                              onClick={() => handleCancelSpecificReservation(reserveData.documentId)}
                                            >
                                              Annuler cette réservation
                                            </Button>
                                          </Col>
                                        </Row>
                                      </Col>
                                      <Row>
                                        {/*<Col xs={12} md={6}>
                                          <InputGroup size="lg" className="my-2">
                                            <InputGroup.Text id="start-date">Nouvelle date de départ</InputGroup.Text>
                                            <Form.Control
                                              type="date"
                                              value={newStartDate}
                                              onChange={(e) => setNewStartDate(e.target.value)}
                                            />
                                          </InputGroup>
                                </Col>*/}
                                        <Col xs={12} md={6}>
                                          <InputGroup size="lg" className="my-2">
                                            <InputGroup.Text id="end-date">Nouvelle date de dépot</InputGroup.Text>
                                            <Form.Control
                                              type="date"
                                              value={newEndDate}
                                              onChange={(e) => setNewEndDate(e.target.value)}
                                            />
                                          </InputGroup>
                                        </Col>
                                      </Row>
                                      <Row>
                                        <Col>
                                          {/* Ajoutez un bouton pour modifier la réservation */}
                                          <Button variant="primary" className="w-100" type="button"
                                            onClick={() => handleModifyReservation(reserveData.documentId)}
                                          >
                                            Modifier réservation
                                          </Button>
                                        </Col>
                                      </Row>
                                    </Accordion.Body>
                                  </Accordion.Item>
                                ))
                              }
                            </Accordion>
                            <div className="mt-2">
                              <Button variant="danger" className="w-100" type="button"
                                onClick={() => handleCancelUserReservations(groupKey)}
                              >
                                Annuler tous les résservations pour cet utilisateur
                              </Button>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      );
                    })
                  }
                </Accordion>
              ) : (
                <p>Aucune réservation n'a été effectuée par les utilisateurs</p>
              )
           : loadingContent
        }
      </div>
    </div>
  );
};

export default RentalsManager;