import React from 'react';
import {Link} from "react-router-dom";

const Admin = () => {
    return (
        <div>
            <h2>Panneau d'administration</h2>
            <div className="p-4">
                <p>Bienvenue dans le panneau d'administration </p>
                <p>Veuillez utiliser les liens de navigation pour la gestion </p>
                <p className='fw-600'><Link to="/">Revenir au site Web</Link></p>
            </div>
        </div>
    );
};

export default Admin;