import React, { useState, useEffect } from "react";
import { Users, Inbox } from "lucide-react";
import API from '../api';
import { useNavigate } from 'react-router-dom';
import "../styles/connection.css";

// Renders an interactive panel allowing startups to manage and respond to investor connection requests.
const ConnectionManager = () => {
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Retrieves the latest pending investor connection requests from the secure backend API.
    const fetchRequests = async () => {
        try {
            const response = await API.get('connections/');
            setRequests(response.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
            setMessage('Unable to load connection requests. Please refresh or log in again.');
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    // Processes the acceptance or rejection of an investor connection request dynamically.
    const handleAction = async (sender_id, action) => {
        try {
            await API.post('connections/', { sender_id, action });
            setMessage(`Request ${action}ed successfully!`);
            fetchRequests();
        } catch (error) {
            setMessage("Failed to process request.");
        }
    };

    return (

        <div className="connection-card">

            <div className="connection-title">

                <Users size={24} />

                Incoming Requests

            </div>

            {message && (

                <p
                    style={{
                        color: "#6366f1",
                        fontWeight: "600",
                        marginBottom: "20px"
                    }}
                >

                    {message}

                </p>

            )}

            {requests.filter(r => r.status === "pending").length === 0 ? (

                <div className="empty-state">

                    <Inbox size={55} />

                    <h3>No Requests</h3>

                    <p>

                        When investors send connection requests,

                        they'll appear here.

                    </p>

                </div>

            ) : (


                requests
                    .filter(req => req.status === "pending")
                    .map(req => (

                        <div
                            key={req.id}
                            className="request-item"
                        >

                            <div className="request-top">

                                <div className="avatar">

                                    {req.sender.username.charAt(0).toUpperCase()}

                                </div>

                                <div className="user-info">

                                    <h4>

                                        {req.sender.username}

                                    </h4>

                                    <p>

                                        Investor wants to connect

                                    </p>

                                </div>

                            </div>

                            <div className="action-buttons">

                                <button

                                    className="btn view"

                                    onClick={() => navigate(`/investor-profile/${req.sender.id}`)}

                                >

                                    View Profile

                                </button>

                                <button

                                    className="btn accept"

                                    onClick={() => handleAction(req.sender.id, "accept")}

                                >

                                    Accept

                                </button>

                                <button

                                    className="btn reject"

                                    onClick={() => handleAction(req.sender.id, "decline")}

                                >

                                    Decline

                                </button>

                            </div>

                        </div>

                    ))

            )}

        </div>

    );


};

export default ConnectionManager;