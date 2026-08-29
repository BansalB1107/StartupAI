import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import API from "../api";

// Retrieves and displays detailed information about a specific startup profile based on URL parameters.
export default function StartupProfile() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [startup, setStartup] = useState(null);

    useEffect(() => {

        API.get(`startup-profile/${id}/`)
            .then(res => setStartup(res.data))
            .catch(console.error);

    }, [id]);

    if (!startup) {

        return (
            <DashboardLayout>
                <div className="dashboard-content">
                    <div className="dashboard-card">
                        Loading...
                    </div>
                </div>
            </DashboardLayout>
        );

    }

    return (

        <DashboardLayout>

            <div className="dashboard-content">

                <button
                    className="connect-btn"
                    style={{
                        width: 160,
                        marginBottom: 20
                    }}
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                <div className="dashboard-card">

                    <h1>{startup.company_name}</h1>

                    <br />

                    <p>
                        <strong>Industry:</strong> {startup.industry}
                    </p>

                    <br />

                    <p>
                        {startup.pitch_description}
                    </p>

                    <br />

                    <h2>
                        Funding Goal
                    </h2>

                    <h1 style={{ color: "#10b981" }}>
                        ₹{Number(startup.funding_goal || 0).toLocaleString()}
                    </h1>

                </div>

            </div>

        </DashboardLayout>

    );

}