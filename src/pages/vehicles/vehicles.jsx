import React from 'react';
import CarOffers from '../../components/car-offers';
import HeroPages from '../../components/HeroPages';



const Vehicles = () => {

    return (
        <div id='vehicles'>
            <HeroPages name="Vehicules" />
            <CarOffers />
        </div>
    );
};
export default Vehicles;