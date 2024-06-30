import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, ListGroup, InputGroup, Form } from 'react-bootstrap';
import { TbEngine, TbManualGearbox } from 'react-icons/tb';
import { BsCarFront, BsFillCarFrontFill, BsFillFuelPumpFill } from 'react-icons/bs';
import { PiEngineFill } from 'react-icons/pi';
import { fetchCars, fetchLocations, fetchReservations } from '../../hooks/useFetchData';
import { loadingContent } from '../../components/general/general-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill1 } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { db } from '../../config/firebase';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';




const MyRentals = () => {
    const locale = 'fr';
    const [date, setDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const user = useSelector(({ UserSlice }) => UserSlice.user);
    const [cars, setCars] = useState(null);
    const [locations, setLocations] = useState(null);
    const [reservations, setReservations] = useState(null);

    useEffect(() => {
        setInterval(() => {
            setDate(new Date());
        }, 60 * 1000);

        Promise.all([
            fetchCars(),
            fetchLocations(),
            fetchReservations(user.email),
        ])
        .then(responses => {
            setCars(responses[0]);
            setLocations(responses[1]);
            setReservations(responses[2]);
            setIsLoading(false);
        });
    }, []);

    const welcomeMessage = () => {
        let day = `${date.toLocaleDateString(locale, { weekday: 'long' })}, ${date.getDate()} ${date.toLocaleDateString(locale, { month: 'long' })}`;
        let hour = date.getHours();
        let wish = ` ${(hour < 12 && 'Bonjour') || (hour < 17 && 'Bon après-midi') || 'Bonsoir'}, `;
        let time = date.toLocaleTimeString(locale, { hour: 'numeric', hour12: true, minute: 'numeric' });

        return <h4 className="mb-1">
            {day} <span className="text-black-50">|</span> {time}
            <hr className="my-1" />
            {wish} <span className='fw-600'>Mr/Mme : </span> <span className="fw-600">{user.firstName}</span>
            <br/>
            <span className='fw-600'>Voici Votre/Vos réservation(s) : </span>
        </h4>;
    };

    const calculateTotalPrice = (startDate, endDate, carPrice) => {
        const oneDay = 24 * 60 * 60 * 1000;
        const firstDate = new Date(startDate);
        const secondDate = new Date(endDate);
        const diffDays = Math.round((secondDate - firstDate) / oneDay);
        return diffDays * carPrice;
    };


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
        <div id="my-rentals">
            <Container className="py-4">
                <Row className="mb-5">
                    <Col>
                        <h1 className="fs-1 text-center text-uppercase">Mes reservations</h1>
                    </Col>
                </Row>
                {
                    user.email &&
                    <div className="d-flex justify-content-center mb-1">
                        {welcomeMessage()}
                    </div>
                }
                <Row>
                    {
                        !isLoading
                            ? reservations
                                ? reservations.map(reserveData => {
                                    return (
                                        <Col xs={{ span: 10, offset: 1 }} key={reserveData.id}>
                                            <Card className="my-2">
                                                <Row>
                                                    <Col xs={12}>
                                                        <ListGroup variant="flush" className="text-center">
                                                            <ListGroup.Item variant="secondary" action>
                                                                <BsFillCarFrontFill size="2em" className="me-2" style={{ marginTop: "-10px" }} />
                                                                <span className="fs-5 fw-bold">{`${reserveData.carBrand} / ${reserveData.carModel}`}</span>
                                                            </ListGroup.Item>
                                                        </ListGroup>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col xs={12} md={6}>
                                                        <img src={cars[reserveData.carId].image} alt={`${reserveData.carBrand} / ${reserveData.carModel}`} />
                                                    </Col>
                                                    <Col xs={12} md={6}>
                                                        <ListGroup variant="flush">
                                                            <ListGroup.Item>
                                                                <TbEngine size="2em" className="me-2" style={{ marginTop: "-8px" }} />
                                                                <span className="fs-6">Puissance</span> &nbsp;
                                                                <span className="fs-5 fw-bold">{cars[reserveData.carId].power}</span>
                                                            </ListGroup.Item>
                                                            <ListGroup.Item>
                                                                <PiEngineFill size="2em" className="me-2" style={{ marginTop: "-8px" }} />
                                                                <span className="fs-6">Taille Moteur</span> &nbsp;
                                                                <span className="fs-5 fw-bold">{cars[reserveData.carId].engineSize}</span>
                                                            </ListGroup.Item>
                                                            <ListGroup.Item>
                                                                <TbManualGearbox size="2em" className="me-2" style={{ marginTop: "-8px" }} />
                                                                <span className="fs-6">Boîte de vitesse</span> &nbsp;
                                                                <span className="fs-5 fw-bold">{cars[reserveData.carId].gearbox}</span>
                                                            </ListGroup.Item>
                                                            <ListGroup.Item>
                                                                <BsCarFront size="2em" className="me-2" style={{ marginTop: "-10px" }} />
                                                                <span className="fs-6">Type</span> &nbsp;
                                                                <span className="fs-5 fw-bold">{cars[reserveData.carId].bodyType}</span>
                                                            </ListGroup.Item>
                                                            <ListGroup.Item>
                                                                <BsFillFuelPumpFill size="2em" className="me-2" style={{ marginTop: "-10px" }} />
                                                                <span className="fs-6">Type de carburant</span> &nbsp;
                                                                <span className="fs-5 fw-bold">{cars[reserveData.carId].fuelType}</span>
                                                            </ListGroup.Item>
                                                            <ListGroup.Item className="d-flex justify-content-between" action>
                                                                <div>
                                                                    <FontAwesomeIcon icon={faMoneyBill1} size="2x" className="me-2" />
                                                                    <span className="fs-6">Prix par jour:</span>&nbsp;
                                                                    <span className="fs-5 fw-bold">{cars && cars[reserveData.carId] && cars[reserveData.carId].price} DA</span>
                                                                </div>
                                                                <div>
                                                                    <FontAwesomeIcon icon={faMoneyBill1} size="2x" className="me-2" />
                                                                    <span className="fs-6 ">Prix Total:</span>&nbsp;
                                                                    <span className="fs-5 fw-bold text-success">
                                                                        {calculateTotalPrice(reserveData.startDate, reserveData.endDate, cars[reserveData.carId].price) > 0
                                                                            ? calculateTotalPrice(reserveData.startDate, reserveData.endDate, cars[reserveData.carId].price) + " DA"
                                                                            : "0 DA"
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <FontAwesomeIcon icon={faMoneyBill1} size="2x" className="me-2" />
                                                                    <span className="fs-6">Méthode de paiment</span>&nbsp;
                                                                    
                                                                    
                                                                    <span className="fs-5 fw-bold">{reserveData.paymentMethod}</span>
                                                                </div>
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
                                                                        <option value={reserveData.dropoffLocation}>{locations[reserveData.dropoffLocation]}</option>
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
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                                <Button variant="danger" className="w-100" type="button"
                    onClick={() => handleCancelSpecificReservation(reserveData.documentId)}
            >
                Annuler cette réservation
            </Button>

                                            </Card>
                                        </Col>
                                    )
                                })
                                : <Col>
                                    <Card className="text-center text-danger p-5">
                                        <p className="fs-4 mb-5">Vous n'avez pas encore loué de véhicules !</p>
                                        <Link to="/vehicles">
                                            <Button variant="secondary" size="lg" className="primary-bg-color border-0">Cliquez pour parcourir les véhicules</Button>
                                        </Link>
                                    </Card>
                                </Col>
                            : loadingContent
                    }
                </Row>
            </Container>
        </div>
    );
};



export default MyRentals;
