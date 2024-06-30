import React, { useState } from 'react';
import { useSelector } from "react-redux";
import useAuthentication from "../hooks/useAuthentication";
import { Link } from "react-router-dom";

const AdminHeader = () => {
    const [menuActive, setMenuActive] = useState(false);
    const user = useSelector(({ UserSlice }) => UserSlice.user);
    const { signOutCall } = useAuthentication();

    const handleLogout = async () => {
        await signOutCall();
    }

    const toggleMenu = () => {
        setMenuActive(!menuActive);
    }

    return (
        <header className="admin-header">
            <div className="admin-header-content">
                <div className="container">
                    <div className="text-center text-sm-start">
                        <h2 className="mt-1 mb-2">
                            <div className="text-light">Panneau d'administrateur</div>
                        </h2>
                    </div>
                    <div className="admin-account">
                        <h6 className="text-light">
                            Compte admin: <br /><span className="text-light fw-500">{`${user.email} (${user.role})`}</span>
                        </h6>
                    </div>
                </div>
            </div>
            <nav className="navbar2">
                <div className="container">
                    <div className="navbar2-toggle" onClick={toggleMenu}>
                        ☰
                    </div>
                    <div className={`navbar2-menu ${menuActive ? 'active' : ''}`}>
                        <Link to="/admin" className="nav2-link">Page principal</Link>
                        <Link to="users" className="nav2-link">Utilisateurs</Link>
                        <div className="nav2-dropdown">
                            <span className="nav2-link">&ensp;&ensp;Véhicules</span>
                            <div className="nav2-dropdown-content">
                                <Link to="vehicles/brands">Marques</Link>
                                <Link to="vehicles/models">Modeles</Link>
                                <div className="dropdown-divider"></div>
                                <Link to="vehicles/cars">Voitures</Link>
                            </div>
                        </div>
                        <Link to="locations" className="nav2-link">Emplacement</Link>
                        <Link to="rentals" className="nav2-link">Réservation</Link>
                        <Link to="contact-form" className="nav2-link">Messages</Link>
                        <button className="logout-button" type="button" onClick={handleLogout}>Déconnecter</button>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default AdminHeader;