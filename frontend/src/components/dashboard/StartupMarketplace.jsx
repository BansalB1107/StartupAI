import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../../api";

// Renders a browsable marketplace grid of startup pitches, allowing investors to request connections or invest.
export default function StartupMarketplace({
    startups,
    loading,
    fetchError,
    actionLoading,
    handleConnectRequest,
    refreshData,
}) {

    const navigate = useNavigate();

    const [amounts, setAmounts] = useState({});
    const [loadingInvestment, setLoadingInvestment] = useState({});

    const invest = async (startup) => {

        const amount = amounts[startup.id];

        if (!amount || Number(amount) <= 0) {
            alert("Enter a valid investment amount.");
            return;
        }

        try {

            setLoadingInvestment(prev => ({
                ...prev,
                [startup.id]: true,
            }));

            await API.post("invest/", {
                startup_id: startup.user_id,
                amount: Number(amount),
            });

            alert("🎉 Investment Successful!");

            setAmounts(prev => ({
                ...prev,
                [startup.id]: "",
            }));

            if (refreshData) {
                refreshData();
            }

        } catch (err) {

            alert(
                err.response?.data?.error ||
                "Investment failed."
            );

        } finally {

            setLoadingInvestment(prev => ({
                ...prev,
                [startup.id]: false,
            }));

        }

    };

    return (

        <div className="dashboard-card">

            <div className="section-header">

                <div>

                    <h2>Startup Marketplace</h2>

                    <p>
                        Browse startups looking for investors.
                    </p>

                </div>

            </div>

            {fetchError && (

                <div className="error-banner">

                    ⚠️ {fetchError}

                </div>

            )}

            {loading ? (

                <p>Loading deal flow...</p>

            ) : !Array.isArray(startups) || startups.length === 0 ? (

                <p className="empty-text">
                    No startup pitches available right now.
                </p>

            ) : (

                <div className="marketplace-grid">

                    {startups.map((startup, index) => (

                        <motion.div
                            key={startup.id}
                            className="startup-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                        >

                            <div className="card-top">

                                <span className="industry-badge">
                                    {startup.industry || "Startup"}
                                </span>

                                <span className="status-badge">
                                    {startup.connection_status || "Open"}
                                </span>

                            </div>

                            <h3 className="company-name">
                                {startup.company_name}
                            </h3>

                            <p className="company-description">
                                {startup.pitch_description ||
                                    "No description provided."}
                            </p>

                            <div className="funding-box">

                                <span className="funding-label">
                                    Funding Goal
                                </span>

                                <span className="funding-value">
                                    ₹{Number(startup.funding_goal || 0).toLocaleString()}
                                </span>

                            </div>

                            {/* View Profile */}

                            <button
                                className="connect-btn"
                                style={{
                                    background: "#2563eb",
                                    marginTop: "12px",
                                    marginBottom: "10px",
                                }}
                                onClick={() =>
                                    navigate(`/startup-profile/${startup.user_id}`)
                                }
                            >
                                👁 View Profile
                            </button>

                            {startup.connection_status === "" ? (

                                <button
                                    className="connect-btn"
                                    onClick={() =>
                                        handleConnectRequest(
                                            startup.user_id,
                                            startup.id
                                        )
                                    }
                                    disabled={actionLoading[startup.id]}
                                >

                                    {actionLoading[startup.id]
                                        ? "Sending..."
                                        : "Connect"}

                                </button>

                            ) : startup.connection_status === "pending" ? (

                                <button
                                    className="pending-btn"
                                    disabled
                                >
                                    Request Pending
                                </button>

                            ) : startup.connection_status === "accepted" ? (

                                <>

                                    <button
                                        className="connected-btn"
                                        disabled
                                    >
                                        ✅ Connected
                                    </button>

                                    <input
                                        type="number"
                                        placeholder="Enter investment amount"
                                        value={amounts[startup.id] || ""}
                                        onChange={(e) =>
                                            setAmounts(prev => ({
                                                ...prev,
                                                [startup.id]: e.target.value,
                                            }))
                                        }
                                        style={{
                                            width: "100%",
                                            marginTop: "12px",
                                            padding: "10px",
                                            borderRadius: "10px",
                                            border: "1px solid var(--border)",
                                            background: "var(--surface)",
                                            color: "var(--text)",
                                        }}
                                    />

                                    <button
                                        className="connect-btn"
                                        style={{
                                            marginTop: "10px",
                                        }}
                                        disabled={loadingInvestment[startup.id]}
                                        onClick={() => invest(startup)}
                                    >

                                        {loadingInvestment[startup.id]
                                            ? "Investing..."
                                            : "💰 Invest Now"}

                                    </button>

                                </>

                            ) : (

                                <button
                                    className="declined-btn"
                                    disabled
                                >
                                    Declined
                                </button>

                            )}

                        </motion.div>

                    ))}

                </div>

            )}

        </div>

    );

}