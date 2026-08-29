import React, { useEffect, useState } from "react";
import API from "../api";
import DashboardLayout from "./layout/DashboardLayout";
import {
    Eye,
    Activity,
    Users,
    Clock,
    TrendingUp,
    ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Renders a dedicated analytics dashboard displaying profile views, health scores, and recent investor engagement metrics.
function StartupAnalytics() {

    const [stats, setStats] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {

        const fetchStats = async () => {

            try {

                const res = await API.get("analytics/");
                setStats(res.data);

            } catch {

                console.error("Failed to load analytics");

            }

        };

        fetchStats();

    }, []);

    if (!stats) {

        return (

            <DashboardLayout>

                <div className="dashboard-content">

                    <div className="dashboard-card">

                        <h2>Loading Analytics...</h2>

                    </div>

                </div>

            </DashboardLayout>

        );

    }

    return (

        <DashboardLayout>

            <div className="dashboard-content">

                <button
                    onClick={() => navigate(-1)}
                    className="connect-btn"
                    style={{
                        width: "150px",
                        marginBottom: "25px",
                    }}
                >
                    <ArrowLeft size={18} />
                    &nbsp; Back
                </button>

                <div className="dashboard-card">

                    <h1
                        style={{
                            color: "var(--text)",
                            marginBottom: "8px",
                        }}
                    >
                        Startup Analytics
                    </h1>
                    <br />
                    <p
                        style={{
                            color: "var(--text-light)",
                            marginBottom: "30px",
                        }}
                    >
                        Monitor your startup performance and investor engagement.
                    </p>

                    <div className="stats-grid">

                        <div className="stat-card">

                            <div
                                className="icon"
                                style={{ background: "#6366f1" }}
                            >
                                <Eye size={28} color="white" />
                            </div>

                            <div>

                                <h2 className="stat-number">
                                    {stats.profile_views}
                                </h2>

                                <p className="stat-title">
                                    Profile Views
                                </p>

                            </div>

                        </div>

                        <div className="stat-card">

                            <div
                                className="icon"
                                style={{ background: "var(--primary)" }}
                            >
                                <Activity size={28} color="white" />
                            </div>

                            <div>

                                <h2 className="stat-number">
                                    {stats.profile_health}%
                                </h2>

                                <p className="stat-title">
                                    Profile Health
                                </p>

                            </div>

                        </div>

                        <div className="stat-card">

                            <div
                                className="icon"
                                style={{ background: "#f59e0b" }}
                            >
                                <Clock size={28} color="white" />
                            </div>

                            <div>

                                <h2 className="stat-number">
                                    {stats.pending_connections}
                                </h2>

                                <p className="stat-title">
                                    Pending Requests
                                </p>

                            </div>

                        </div>

                        <div className="stat-card">

                            <div
                                className="icon"
                                style={{ background: "#10b981" }}
                            >
                                <Users size={28} color="white" />
                            </div>

                            <div>

                                <h2 className="stat-number">
                                    {stats.total_connections}
                                </h2>

                                <p className="stat-title">
                                    Connected Investors
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                <div
                    className="dashboard-card"
                    style={{ marginTop: "30px" }}
                >

                    <h2
                        style={{
                            color: "var(--text)",
                            marginBottom: "20px",
                            textAlign: "center",
                        }}
                    >
                        Investor Interest Score
                    </h2>

                    <div
                        className="progress-bar"
                        style={{ marginBottom: "15px" }}
                    >
                        <div
                            className="progress-fill"
                            style={{
                                width: `${stats.investor_interest_score}%`,
                            }}
                        />
                    </div>

                    <h2
                        style={{
                            color: "#6366f1",
                            textAlign: "center",
                        }}
                    >
                        {stats.investor_interest_score}%
                    </h2>

                </div>

                <div
                    className="dashboard-card"
                    style={{ marginTop: "30px" }}
                >

                    <h2
                        style={{
                            color: "var(--text)",
                            marginBottom: "25px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <TrendingUp size={22} />
                        Recent Profile Visitors
                    </h2>

                    {

                        stats.recent_viewers.length > 0 ?

                            stats.recent_viewers.map((viewer, index) => (

                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "18px",
                                        border: "1px solid var(--border)",
                                        borderRadius: "14px",
                                        marginBottom: "15px",
                                        background: "var(--surface)",
                                    }}
                                >

                                    <div>

                                        <strong
                                            style={{
                                                color: "var(--text)",
                                            }}
                                        >
                                            👤 {viewer.username}
                                        </strong>

                                        <p
                                            style={{
                                                margin: "6px 0 0",
                                                color: "var(--text-light)",
                                            }}
                                        >
                                            Viewed your startup profile
                                        </p>

                                    </div>

                                    <small
                                        style={{
                                            color: "var(--text-light)",
                                        }}
                                    >
                                        {viewer.time}
                                    </small>

                                </div>

                            ))

                            :

                            <p
                                style={{
                                    color: "var(--text-light)",
                                }}
                            >
                                No recent visitors yet.
                            </p>

                    }

                </div>

            </div>

        </DashboardLayout>

    );

}

export default StartupAnalytics;