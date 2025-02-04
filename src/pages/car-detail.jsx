import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { Container, Row, Col, Form, ListGroup, InputGroup, Button } from 'react-bootstrap';
import { TbEngine, TbManualGearbox } from "react-icons/tb";
import { BsCarFront, BsFillCarFrontFill, BsFillFuelPumpFill } from "react-icons/bs";
import { PiEngineFill } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { makeReservation } from "../redux/features/ReserveSlice";
import { fetchBrands, fetchModels, fetchCars, fetchLocations } from "../hooks/useFetchData";
import { loadingContent } from "../components/general/general-components";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill1 } from '@fortawesome/free-regular-svg-icons';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './Checkout';
import { isAdmin } from "../config/general"; 

const stripePromise = loadStripe('pk_test_oKhSR5nslBRnBZpjO6KuzZeX');

const CarDetail = () => {
    const dispatch = useDispatch();
    const user = useSelector(({ UserSlice }) => UserSlice.user);
    const { carBrand, carModel, carId } = useParams();
    const navigate = useNavigate();

    const [cars, setCars] = useState(null);
    const [brands, setBrands] = useState(null);
    const [models, setModels] = useState(null);
    const [locations, setLocations] = useState(null);
    const [selectedLocations, setSelectedLocations] = useState({ pickup: "", dropoff: "" });
    const [rentDate, setRentDate] = useState({ start: getDateByInputFormat(), end: getDateByInputFormat(1) });
    const [isReservationTimerEnable, setIsReservationTimerEnable] = useState(true);
    const [reservationTimer, setReservationTimer] = useState(300); // in seconds
    const [paymentMethod, setPaymentMethod] = useState('agency'); // default to 'agency'

    useEffect(() => {
        fetchBrands().then(response => setBrands(response));
        fetchModels().then(response => setModels(response));
        fetchCars().then(response => {
            setCars(response);
            setIsReservationTimerEnable(response[carId].carCount > 0);
        });
        fetchLocations().then(response => setLocations(response));
    }, []);

    function getDateByInputFormat(dayOffset = 0, date = null) {
        let currentDate = date === null ? new Date() : new Date(date);
        if (dayOffset === 0) return currentDate.toISOString().split('T')[0];
        const offsetDate = new Date(currentDate);
        offsetDate.setDate(currentDate.getDate() + dayOffset);
        return offsetDate.toISOString().split('T')[0];
    }

    function timerToString() {
        let hours = ('0' + Math.floor(reservationTimer / 3600)).slice(-2);
        let minutes = ('0' + Math.floor(reservationTimer / 60)).slice(-2);
        let seconds = ('0' + reservationTimer % 60).slice(-2);
        return /*hours + ":" +*/ minutes + ":" + seconds;
    }

    function handleReserveTimeout() {
        let redirectTimerInterval;
        Swal.fire({
            title: 'You did not complete the reservation!',
            html: 'You are being redirected in <strong>5</strong> seconds',
            timer: 5000,
            didOpen: () => {
                const content = Swal.getHtmlContainer();
                const $ = content.querySelector.bind(content);
                Swal.showLoading();
                redirectTimerInterval = setInterval(() => {
                    Swal.getHtmlContainer().querySelector('strong').textContent = (Swal.getTimerLeft() / 1000).toFixed(0);
                }, 100);
            },
            willClose: () => {
                clearInterval(redirectTimerInterval);
                navigate("/");
            }
        });
    }

    useEffect(() => {
        if (!isReservationTimerEnable) return;
        if (reservationTimer > 0) {
            setTimeout(() => {
                setReservationTimer(reservationTimer - 1);
            }, 1000);
        } else {
            handleReserveTimeout();
        }
    }, [reservationTimer]);

    const handleReserveButtonClick = async event => {
        if (!user.email) {
            Swal.fire({
                title: "You have to log in",
                text: "Please log in for reservation",
                icon: "info",
                showConfirmButton: true
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/login");
                }
            });
        } else {
            if (Object.values(selectedLocations).some(value => value === "")) {
                let resultContent = Object.values(selectedLocations).every(value => value === "")
                    ? "Please choose locations!"
                    : selectedLocations.pickup === ""
                        ? "Please choose pick-up location!"
                        : "Please choose drop-off location!";
                Swal.fire({ title: resultContent, icon: "warning" });
                return;
            }
            event.currentTarget.disabled = true;
            setIsReservationTimerEnable(false);

            const reservationData = {
                reservationOwner: user.email,
                nom: user.lastName,
                prenom: user.firstName,
                telephone: user.phone,
                wilaya: user.wilaya,
                birthDate: user.birthDate,
                permis: user.licenseNumber,
                carId: parseInt(carId) || 0,
                carBrand: carBrand,
                carModel: carModel,
                startDate: rentDate.start,
                endDate: rentDate.end,
                pickupLocation: selectedLocations.pickup.toString(), 
                dropoffLocation: selectedLocations.dropoff.toString(),
                pricePerDay: cars[carId].price,
                totalPrice: calculateTotalPrice(),
                paymentMethod: paymentMethod
            };

            const carsClone = Object.assign({}, cars);
            carsClone[carId].carCount = carsClone[carId].carCount - 1;
            setDoc(doc(db, "vehicle", "cars"), carsClone);
            addDoc(collection(db, "rentals"), reservationData)
                .then(() => {
                    Swal.fire(
                        'Réservation terminée !',
                        'Votre réservation a été confirmée avec succès.',
                        'success'
                    );
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
    };

    function calculateTotalPrice() {
        const startDate = new Date(rentDate.start);
        const endDate = new Date(rentDate.end);
        const timeDiff = Math.abs(endDate - startDate);
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (cars && cars[carId]) {
            const carPrice = cars[carId].price;
            const totalPrice = daysDiff * carPrice;
            return totalPrice;
        } else {
            return 0;
        }
    }

    return (
        <div id="car-detail" style={{ clear: "both" }}>
            <Container className="py-4">
                <Row className="mb-5">
                    
                </Row>
                {
                    cars && brands && models && locations ?
                        <>
                            <Row className="mb-4">
                                <Col xs={12} md={6}>
                                    <LazyLoadImage
                                        src={cars[carId].image}
                                        className="img-fluid"
                                        effect="blur"
                                        alt={`${carBrand} / ${carModel}`}
                                    />
                                </Col>
                                <Col xs={12} md={6}>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item className="d-flex align-items-center" action>
                                            <BsFillCarFrontFill size="2em" className="me-2" />
                                            <span className="fs-6">Marque et modèle</span>&nbsp;
                                            <span className="fs-5 fw-bold">{`${carBrand} / ${carModel}`}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex align-items-center" action>
                                            <TbEngine size="2em" className="me-2" />
                                            <span className="fs-6">Puissance</span>&nbsp;
                                            <span className="fs-5 fw-bold">{cars[carId].power}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex align-items-center" action>
                                            <PiEngineFill size="2em" className="me-2" />
                                            <span className="fs-6">Taille Moteur</span>&nbsp;
                                            <span className="fs-5 fw-bold">{cars[carId].engineSize}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex align-items-center" action>
                                            <TbManualGearbox size="2em" className="me-2" />
                                            <span className="fs-6">Boîte de vitesses</span>&nbsp;
                                            <span className="fs-5 fw-bold">{cars[carId].gearbox}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex align-items-center" action>
                                            <BsCarFront size="2em" className="me-2" />
                                            <span className="fs-6">Type</span>&nbsp;
                                            <span className="fs-5 fw-bold">{cars[carId].bodyType}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex align-items-center" action>
                                            <BsFillFuelPumpFill size="2em" className="me-2" />
                                            <span className="fs-6">Type de carburant</span>&nbsp;
                                            <span className="fs-5 fw-bold">{cars[carId].fuelType}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="d-flex justify-content-between" action>
                                            <div>
                                                <FontAwesomeIcon icon={faMoneyBill1} size="2x" className="me-2" />
                                                <span className="fs-6">Prix par jour:</span>&nbsp;
                                                <span className="fs-5 fw-bold">{cars && cars[carId] && cars[carId].price} DA</span>
                                            </div>
                                            <div>
                                                <FontAwesomeIcon icon={faMoneyBill1} size="2x" className="me-2" />
                                                <span className="fs-6 ">Prix Total:</span>&nbsp;
                                                <span className="fs-5 fw-bold text-success">{calculateTotalPrice() > 0 ? calculateTotalPrice() + " DA" : "0 DA"}</span>
                                            </div>
                                        </ListGroup.Item>
                                    </ListGroup>
                                    <div className="text-end">
                                        <span className={`text-secondary fst-italic ${cars[carId].carCount > 0 ? "text-success" : "text-danger"}`}>
                                            Nombre dans le Stock: {cars[carId].carCount}
                                        </span>
                                    </div>
                                </Col>
                            </Row>
                            

                            <Row>
                                <Col xs={12} md={6}>
                                    <InputGroup size="lg" className="my-2">
                                        <InputGroup.Text id="pick-up-locations">Lieu de départ</InputGroup.Text>
                                        <Form.Select
                                            name="pick-up-locations" size="lg"
                                            defaultValue={selectedLocations.pickup}
                                            onChange={e => {
                                                setSelectedLocations(prevState => ({
                                                    ...prevState,
                                                    pickup: e.target.value
                                                }));
                                            }}
                                        >
                                            <option value="">Choisissez un lieu</option>
                                            {
                                                Object.entries(locations).map(([key, value]) =>
                                                    <option key={key} value={key}>{value}</option>
                                                )
                                            }
                                        </Form.Select>
                                    </InputGroup>
                                </Col>
                                <Col xs={12} md={6}>
                                    <InputGroup size="lg" className="my-2">
                                        <InputGroup.Text id="start-date">Date de départ</InputGroup.Text>
                                        <Form.Control
                                            type="date"
                                            min={getDateByInputFormat()}
                                            name="start-date"
                                            placeholder="Start Date"
                                            value={rentDate.start}
                                            onKeyDown={e => e.preventDefault()}
                                            onChange={e => {
                                                setRentDate({
                                                    start: e.target.value,
                                                    end: getDateByInputFormat(1, e.target.value)
                                                });
                                            }}
                                        />
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} md={6}>
                                    <InputGroup size="lg" className="my-2">
                                        <InputGroup.Text id="drop-off-locations">Lieu de retour</InputGroup.Text>
                                        <Form.Select
                                            name="drop-off-locations" size="lg"
                                            defaultValue={selectedLocations.dropoff}
                                            onChange={e => {
                                                setSelectedLocations(prevState => ({
                                                    ...prevState,
                                                    dropoff: e.target.value
                                                }));
                                            }}
                                        >
                                            <option value="">Choisissez un lieu</option>
                                            {
                                                Object.entries(locations).map(([key, value]) =>
                                                    <option key={key} value={key}>{value}</option>
                                                )
                                            }
                                        </Form.Select>
                                    </InputGroup>
                                </Col>
                                <Col xs={12} md={6}>
                                    <InputGroup size="lg" className="my-2">
                                        <InputGroup.Text id="end-date">Date de retour</InputGroup.Text>
                                        <Form.Control
                                            type="date"
                                            min={getDateByInputFormat(1, rentDate.start)}
                                            name="end-date"
                                            placeholder="End Date"
                                            value={rentDate.end}
                                            onKeyDown={e => e.preventDefault()}
                                            onChange={e => {
                                                setRentDate(prevState => ({
                                                    ...prevState,
                                                    end: e.target.value
                                                }));
                                            }}
                                        />
                                    </InputGroup>
                                </Col>
                            </Row>
                            <Row className="my-3">
                                <Col>
                                    <Form.Check
                                        type="radio"
                                        id="payment-agency"
                                        name="paymentMethod"
                                        label="Agence"
                                        value="agence"
                                        checked={paymentMethod === 'agence'}
                                        onChange={() => setPaymentMethod('agence')}
                                    />
                                    <p>Veuillez vous présenter à l'agence pour finaliser votre paiement.</p>
                                </Col>
                                <Col>
                                    <Form.Check
                                        type="radio"
                                        id="payment-online"
                                        name="paymentMethod"
                                        label="En ligne"
                                        value="online"
                                        checked={paymentMethod === 'online'}
                                        onChange={() => setPaymentMethod('online')}
                                    />
                                </Col>
                            </Row>
                            
                            {paymentMethod === 'agency' && (
                                <div className="text-center">
                                    <p>Veuillez vous présenter à l'agence pour finaliser votre paiement.</p>
                                </div>
                            )}
                            {paymentMethod === 'online' && (
                                <Elements stripe={stripePromise}>
                                    <CheckoutForm amount={calculateTotalPrice()} />
                                </Elements>
                            )}
                            <Row>
                                <Col>
                                    <Button variant="success" size="lg" className="w-100 fs-4 fw-bold"
                                        type="button"
                                        onClick={handleReserveButtonClick}
                                        disabled={cars[carId].carCount <= 0 || isAdmin(user.role)}>
                                        Reservez Maintenat !
                                    </Button>
                                </Col>
                            </Row>
                        </>
                        :
                        loadingContent
                }
            </Container>
        </div>
    );
};

export default CarDetail;
