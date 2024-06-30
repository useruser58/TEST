import React from 'react';
import { Container, Row, Col } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import AdminHeader from "./admin-header";

const AdminLayout = () => {
    return (
        <Container fluid className="bg-dark min-vh-100">
            <Row>
                <Col xs={12} md={3} className="p-0">
                    {/* La barre de navigation verticale */}
                    <AdminHeader />
                </Col>
                <Col xs={12} md={9}>
                    {/* Contenu de la page */}
                    <Container fluid className="bg-light min-vh-100">
                        <Row className="justify-content-md-center">
                            <Col xs={12}>
                                <div className="bg-white mt-2 mb-4 p-4 border border-1 rounded">
                                    {/* Utilisez Outlet pour afficher le contenu de la page */}
                                    <Outlet />
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminLayout;
