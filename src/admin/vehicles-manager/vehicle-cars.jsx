import React, { useState, useEffect } from 'react';
import { Accordion, Button, Form, InputGroup, useAccordionButton } from "react-bootstrap";

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, storage } from "../../config/firebase";
import Swal from "sweetalert2";

import Select from "react-select";
import { fetchBrands, fetchModels, fetchCars, fetchLocations } from "../../hooks/useFetchData";
import { loadingContent } from "../../components/general/general-components";

const VehicleCars = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [cars, setCars] = useState(null);
  const [isChangesCompleted, setIsChangesCompleted] = useState(false);

  const [brands, setBrands] = useState(null);
  const [models, setModels] = useState(null);
  const [modelsByBrandId, setModelsByBrandId] = useState(null);

  const [locations, setLocations] = useState(null);

  useEffect(() => {
    fetchBrands().then(response => setBrands(response));
    fetchModels().then(response => setModels(response));
    fetchCars().then(response => setCars(response));
    fetchLocations().then(response => setLocations(response));
  }, []);

  const handleBrandChange = (e) => {
    const selectedValue = e.target.value;

    if (selectedValue && Object.values(models).length > 0) {
      const currentModels = selectedValue && Object.values(models).find((i) => i.brandId == selectedValue).models;
      setModelsByBrandId(currentModels);
    } else {
      setModelsByBrandId(null);
    }
  };

  useEffect(() => {
    if (cars && isChangesCompleted) {
      uploadDocToFirebase();
      setIsChangesCompleted(false);
    }
  }, [cars, isChangesCompleted]);

  const handleSaveChangesButton = async (event) => {
    event.preventDefault();

    setIsLoading(true);

    await Promise.all(
      Object.values(cars).map(async (item, index) => {
        if (!('File' in window && item.image instanceof File)) return null;

        const uploadedImageUrl = await uploadImageToStorage(item.image);
        setCars((prevState) => ({
          ...prevState,
          [index]: {
            ...prevState[index],
            image: uploadedImageUrl
          }
        }));
      })
    );

    setIsChangesCompleted(true);
  };

  const uploadDocToFirebase = async () => {
    setDoc(doc(db, "vehicle", "cars"), cars)
      .then(() => {
        setIsLoading(false);
        Swal.fire({
          title: "Good job!",
          text: "All changes saved!",
          icon: "success"
        });
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!"
        });
      });
  };

  const uploadImageToStorage = async (file) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `vehicle-images/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file, file.type);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% Done!`);
        },
        (err) => {
          console.log(`Upload Error: ${err}`);
          reject();
        },
        () => {
          console.log("Upload is Completed!");
          getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
            console.log("download url ready: " + downloadURL);
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleAddNewSubmit = (event) => {
    event.preventDefault();

    console.log(event.target.elements);

    let eventElementsArray =
      Array.from(event.target.elements)
        .filter((element) => element.name)
        .map((e) => ({
          [e.name]:
            e.name !== "image"
              ? e.name === "brandId" || e.name === "modelId" || e.name === "carCount"
                ? e.value ? parseInt(e.value) || 0 : ""
                : e.value
              : e.files[0]
        }));
    let selectedLocations = eventElementsArray.filter(
      (i) => i.availableLocations
    ).map((i) => i.availableLocations);
    let newCar = Object.assign({}, ...eventElementsArray);
    newCar.availableLocations = selectedLocations;

    console.log(newCar);

    let newCarIndex = cars
      ? Object.values(cars).length
      : 0;

    setCars((prevState) => ({
      ...prevState,
      [newCarIndex]: newCar
    }));

    event.target.reset();
  };
  const handleRemoveButton = (key) => {
    setCars((current) => {
      const copy = { ...current };
      delete copy[key];

      return copy;
    });

    setCars((current) => {
      const copy = { ...current };
      Object.keys(copy).map((id, index) => {
        copy[index] = copy[id];
        if (index != id) delete copy[id];
      });

      return copy;
    });
  };
  const handleInputChange = (event, index) => {
    let e = event.target ? event.target : { name: "availableLocations", value: event.map((i) => i.value) };

    setCars((current) => {
      return {
        ...current,
        [index]: {
          ...current[index],
          [e.name]:
            e.name !== "image"
              ? e.name === "brandId" || e.name === "modelId" || e.name === "carCount"
                ? e.value ? parseInt(e.value) || 0 : ""
                : e.value
              : e.files[0]
        }
      };
    });
  };

  const handleDisplayImage = (imgUrl) => {
    Swal.fire({
      imageUrl: imgUrl,
      imageWidth: "100%",
      imageAlt: "Car Image"
    });
  };

  return (
    <div>
      <h1>Voitures</h1>
      <div className="d-grid gap-2 p-3">
        {cars && brands && models && !isLoading ? (
          <>
            <Accordion>
              {Object.values(cars).map((item, index) => {
                let currBrandName =
                  item.brandId.length != 0 ? Object.values(brands)[item.brandId] : null;
                let currModelsByBrandId =
                  item.brandId.length != 0 ? Object.values(models).find(
                    (i) => i.brandId == item.brandId
                  ).models : null;
                let currModelName = currModelsByBrandId ? currModelsByBrandId[
                  item.modelId
                ] : null;

                return (
                  <Accordion.Item key={index} eventKey={index}>
                    <Accordion.Header className="m-0 p-0">
                      {currBrandName} / {currModelName}
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className="mb-3 input-groups-1">
                        <h3>Caracteristiques</h3>
                        <InputGroup className="my-1">
                          <InputGroup.Text>Marque</InputGroup.Text>
                          <Form.Select
                            name="brandId"
                            defaultValue={item.brandId}
                            onChange={(event) => handleInputChange(event, index)}
                          >
                            <option value="">Séléctionnez une marque</option>
                            {Object.entries(brands).map(([key, value]) => (
                              <option value={key} key={key}>
                                {value}
                              </option>
                            ))}
                          </Form.Select>
                        </InputGroup>
                        <InputGroup className="my-1">
                          <InputGroup.Text>Modèle</InputGroup.Text>
                          <Form.Select
                            name="modelId"
                            defaultValue={item.modelId}
                            onChange={(event) => handleInputChange(event, index)}
                          >
                            <option value="">Modèle</option>
                            {currModelsByBrandId &&
                              Object.entries(currModelsByBrandId).map(
                                ([key, value]) => (
                                  <option value={key} key={key}>
                                    {value}
                                  </option>
                                )
                              )}
                          </Form.Select>
                        </InputGroup>
                        <InputGroup className="my-1">
                          <InputGroup.Text>Image</InputGroup.Text>
                          <Form.Control
                            type="file"
                            name="image"
                            defaultValue={item.image ? item.image.value : null}
                            onChange={(event) => handleInputChange(event, index)}
                          />
                          <Button
                            variant="warning"
                            type="button"
                            onClick={() => handleDisplayImage(item.image)}
                          >
                            Voir l'image
                          </Button>
                        </InputGroup>
                        <InputGroup className="my-1">
                          <InputGroup.Text>Puissance</InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="power"
                            placeholder="Power"
                            defaultValue={item.power}
                            onChange={(event) => handleInputChange(event, index)}
                          />
                        </InputGroup>
                        <InputGroup className="my-1">
                          <InputGroup.Text>Moteur</InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="engineSize"
                            placeholder="Engine Size"
                            defaultValue={item.engineSize}
                            onChange={(event) => handleInputChange(event, index)}
                          />
                        </InputGroup>
                        <InputGroup className="my-1">
                          <InputGroup.Text>Boite vitesse</InputGroup.Text>
                          <Form.Select
                            name="gearbox"
                            defaultValue={item.gearbox}
                            onChange={(event) => handleInputChange(event, index)}
                          >
                            <option value="">Select</option>
                            <option value="Manual">Manual</option>
                            <option value="Automatic">Automatic</option>
                          </Form.Select>
                        </InputGroup>
                        <InputGroup className="my-1">
                          <InputGroup.Text>Type</InputGroup.Text>
                          <Form.Select
                            name="bodyType"
                            defaultValue={item.bodyType}
                            onChange={(event) => handleInputChange(event, index)}
                          >
                            <option value="">Select type...</option>
                            <option value="Sedan">Sedan</option>
                            <option value="Hatchback">Hatchback</option>
                            <option value="SUV">SUV</option>
                            <option value="Coupe">Coupe</option>
                            <option value="Station Wagon">
                              Station Wagon
                            </option>
                            <option value="Minivan/Van">Minivan/Van</option>
                            <option value="Truck">Truck</option>
                            <option value="Convertible">Convertible</option>
                          </Form.Select>
                        </InputGroup>
                        <InputGroup className="my-1">
                          <InputGroup.Text>Carburant</InputGroup.Text>
                          <Form.Select
                            name="fuelType"
                            defaultValue={item.fuelType}
                            onChange={(event) => handleInputChange(event, index)}
                          >
                            <option value="">Selectionnez Carburant...</option>
                            <option value="Gas">Gas</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Hybrid">Hybrid</option>
                          </Form.Select>
                        </InputGroup>
                      </div>
                      <div className="mt-3 input-groups-2">
                        <h3>Info voiture</h3>
                        <InputGroup className="my-1">
                          <InputGroup.Text>Nombre</InputGroup.Text>
                          <Form.Control
                            type="number"
                            name="carCount"
                            placeholder="Available Car Count..."
                            defaultValue={item.carCount}
                            onChange={(event) => handleInputChange(event, index)}
                          />
                        </InputGroup>
                        <InputGroup className="my-1">
                          <InputGroup.Text>Emplacements</InputGroup.Text>
                          <Select
                            isMulti
                            name="availableLocations"
                            defaultValue={item.availableLocations && item.availableLocations.map(
                              (i) => ({
                                label: locations[i],
                                value: i
                              })
                            )}
                            options={Object.entries(locations).map(
                              ([key, value]) => ({
                                label: value,
                                value: key
                              })
                            )}
                            className="react-select w-75"
                            classNamePrefix="select"
                            onChange={(event) => handleInputChange(event, index)}
                          />
                        </InputGroup>
                        <InputGroup className="my-1">
                          <InputGroup.Text>Prix</InputGroup.Text>
                          <Form.Control
                            type="number"
                            name="price"
                            placeholder="Price"
                            value={item.price}
                            onChange={(event) => handleInputChange(event, index)}
                          />
                        </InputGroup>
                      </div>
                      <div className="mt-3 input-groups-2">
                        <Button
                          variant="danger"
                          type="button"
                          className="w-100"
                          onClick={() => handleRemoveButton(index)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                );
              })}
            </Accordion>

            <Accordion>
              <Accordion.Item>
                <Accordion.Header className="m-0 p-0">Ajoutez une voiture</Accordion.Header>
                <Accordion.Body>
                  <Form onSubmit={handleAddNewSubmit}>
                    <div className="mb-3 input-groups-1">
                      <h3>Caracteristiques</h3>
                      <InputGroup className="my-1">
                        <InputGroup.Text>Marque</InputGroup.Text>
                        <Form.Select
                          name="brandId"
                          onChange={handleBrandChange}
                          required={true}
                        >
                          <option value="">selectionnez</option>
                          {brands &&
                            Object.entries(brands).map(([key, value]) => (
                              <option value={key} key={key}>
                                {value}
                              </option>
                            ))}
                        </Form.Select>
                      </InputGroup>
                      <InputGroup className="my-1">
                        <InputGroup.Text>Modèle</InputGroup.Text>
                <Form.Select name="modelId" required={true}>
                          <option value="">Select Modele </option>
                          {modelsByBrandId &&
                            Object.entries(modelsByBrandId).map(
                              ([key, value]) => (
                                <option value={key} key={key}>
                                  {value}
                                </option>
                              )
                            )}
                        </Form.Select>
                      </InputGroup>
                      <InputGroup className="my-1">
                        <InputGroup.Text>Image</InputGroup.Text>
                        <Form.Control type="file" name="image" required={true} />
                      </InputGroup>
                      <InputGroup className="my-1">
                        <InputGroup.Text>Puissance</InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="power"
                          placeholder="Power"
                          required={true}
                        />
                      </InputGroup>
                      <InputGroup className="my-1">
                        <InputGroup.Text>Moteur</InputGroup.Text>
                        <Form.Control
                          type="text"
                          name="engineSize"
                          placeholder="Engine Size"
                          required={true}
                        />
                      </InputGroup>
                      <InputGroup className="my-1">
                        <InputGroup.Text>Boite vitesse</InputGroup.Text>
                        <Form.Select name="gearbox" required={true}>
                          <option value="">Selectionnez boite vitesse</option>
                          <option value="manual">Manual</option>
                          <option value="automatic">Automatic</option>
                        </Form.Select>
                      </InputGroup>
                      <InputGroup className="my-1">
                        <InputGroup.Text>Type</InputGroup.Text>
                        <Form.Select name="bodyType" required={true}>
                          <option value="">Selectionnez type</option>
                          <option value="Sedan">Sedan</option>
                          <option value="Hatchback">Hatchback</option>
                          <option value="SUV">SUV</option>
                          <option value="Coupe">Coupe</option>
                          <option value="Station Wagon">Station Wagon</option>
                          <option value="Minivan/Van">Minivan/Van</option>
                          <option value="Truck">Truck</option>
                          <option value="Convertible">Convertible</option>
                        </Form.Select>
                      </InputGroup>
                      <InputGroup className="my-1">
                        <InputGroup.Text>Carburant</InputGroup.Text>
                        <Form.Select name="fuelType" required={true}>
                          <option value="">Carburant</option>
                          <option value="Gas">Gas</option>
                          <option value="Diesel">Diesel</option>
                          <option value="Hybrid">Hybrid</option>
                        </Form.Select>
                      </InputGroup>
                    </div>
                    <div className="mt-3 input-groups-2">
                      <h3>Info vehicule</h3>
                      <InputGroup className="my-1">
                        <InputGroup.Text>Nombre </InputGroup.Text>
                        <Form.Control
                          type="number"
                          name="carCount"
                          placeholder="Nombre voitures "
                          required={true}
                        />
                      </InputGroup>
                      <InputGroup className="my-1">
                        <InputGroup.Text>Emplacements</InputGroup.Text>
                        <Select
                          isMulti
                          name="availableLocations"
                          options={Object.entries(locations).map(
                            ([key, value]) => ({
                              label: value,
                              value: key
                            })
                          )}
                          className="react-select w-75"
                          classNamePrefix="Selectionnez"
                          placeholder="Choisir"
                          required={true}
                        />
                      </InputGroup>
                      <InputGroup className="my-1">
                      <InputGroup.Text>Prix</InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="price"
                        placeholder="Price"
                        required
                      />
                    </InputGroup>
                    </div>
                    <div className="mt-3 input-groups-3">
                      <Button variant="primary" type="submit" className="w-100">
                        Ajouter
                      </Button>
                    </div>
                  </Form>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            <Button variant="success" type="button" onClick={handleSaveChangesButton}>
              Sauvegarder
            </Button>
          </>
        ) : (
          loadingContent
        )}
      </div>
    </div>
  );
};

export default VehicleCars;