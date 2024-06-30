import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, InputGroup } from "react-bootstrap";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

import { fetchUsers } from "../../hooks/useFetchData";
import { loadingContent } from "../../components/general/general-components";

import { UserRoles, isAdmin } from "../../config/general";

const UsersManager = () => {

    const user = useSelector(({ UserSlice }) => UserSlice.user);

    const [isLoading, setIsLoading] = useState(false);

    const [users, setUsers] = useState(null);

    const refs = useRef([]);

    useEffect(() => {
        fetchUsers().then(response => setUsers(response));
    }, [])

    const handleUpdateButton = async key => {
        let role = refs.current[key].value;
        setIsLoading(true);
        const userRef = doc(db, "users", users[key].id);
        updateDoc(userRef, { role })
            .then(() => {
                Swal.fire({
                    title: "Good job!",
                    text: "All changes saved!",
                    icon: "success",
                    showConfirmButton: true
                }).then((result) => {
                    if (result.isConfirmed)
                        window.location.reload()
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

    const handleDeleteButton = async key => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to delete this user?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                setIsLoading(true);
                const userRef = doc(db, "users", users[key].id);
                deleteDoc(userRef)
                    .then(() => {
                        Swal.fire(
                            'Deleted!',
                            'The user has been deleted.',
                            'success'
                        ).then(() => {
                            window.location.reload();
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
            <h1>Panneau d'administration</h1>
            <div className="d-grid gap-2 p-3">
                {
                    users && !isLoading
                        ?
                        <>
                            <h2>Gérer utilisateurs</h2>
                            {
                                Object.entries(users).map(([key, value]) => {

                                    let isAnAdmin = isAdmin(value.role);
                                    let isCurrentUser = value.email === user.email;
                                    return (
                                        <div key={key} className="my-2">
                                            <InputGroup>
                                                <Form.Control
                                                    type="text"
                                                    name="userEmail"
                                                    value={value.email}
                                                    placeholder="User email..."
                                                    disabled={true}
                                                />
                                                <Form.Select
                                                    name="userRole"
                                                    defaultValue={value.role}
                                                    disabled={isAnAdmin && isCurrentUser}
                                                    ref={event => refs.current[key] = event}
                                                >
                                                    <option value="">Select a role...</option>
                                                    {
                                                        Object.keys(UserRoles).map(key => (
                                                            <option key={key} value={key}>
                                                                {UserRoles[key]}
                                                            </option>
                                                        ))
                                                    }
                                                </Form.Select>
                                                <Button variant="success" type="button"
                                                    onClick={() => handleUpdateButton(key)}
                                                    disabled={isAnAdmin && isCurrentUser}>
                                                    Modifier
                                                </Button>
                                                <Button variant="danger" type="button"
                                                    onClick={() => handleDeleteButton(key)}
                                                    disabled={isAnAdmin && isCurrentUser}>
                                                    Suprimer
                                                </Button>
                                            </InputGroup>
                                        </div>
                                    )
                                })
                            }
                        </>
                        :
                        loadingContent
                }
            </div>
        </div>
    );
};

export default UsersManager;
