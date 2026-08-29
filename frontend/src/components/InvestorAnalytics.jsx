import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Wallet,
    Building2,
    Users,
    MessageCircle,
    ArrowLeft,
    Sparkles,
    BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import API from "../api";

// Renders an analytical dashboard for investors to review capital deployment, portfolio stats, and deal flow.
export default function InvestorAnalytics() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        wallet: 0,
        startups: 0,
        messages: 0,
        connections: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await API.get("dashboard-stats/");
                setStats(res.data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    const statItems = [
        {
            title: "Wallet Funds",
            value: `₹${Number(stats.wallet).toLocaleString("en-IN")}`,
            icon: Wallet,
            color: "var(--success)",
            bg: "var(--success-glow)"
        },
        {
            title: "Pitched Startups",
            value: stats.startups,
            icon: Building2,
            color: "var(--primary)",
            bg: "var(--primary-glow)"
        },
        {
            title: "Inbound Messages",
            value: stats.messages,
            icon: MessageCircle,
            color: "var(--secondary)",
            bg: "var(--secondary-glow)"
        },
        {
            title: "Active Connections",
            value: stats.connections,
            icon: Users,
            color: "var(--warning)",
            bg: "var(--warning-glow)"
        }
    ];

    return (
        <DashboardLayout>
            <div className="dashboard-content">
                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <button
                        className="refresh-btn"
                        style={{ 
                            width: "auto", 
                            padding: "0 16px", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px", 
                            marginBottom: "24px",
                            height: "38px",
                            fontSize: "13px",
                            fontWeight: "700"
                        }}
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>
                </motion.div>

                {/* Header Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="dashboard-card"
                    style={{ padding: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}
                >
                    <div>
                        <h1 style={{ margin: "0 0 6px 0", fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                            📊 Portfolio Analytics
                        </h1>
                        <p style={{ margin: 0, color: "var(--text-light)", fontSize: "14px" }}>
                            Review your fund deployment metrics, deal-flow responses, and active connection status.
                        </p>
                    </div>

                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 16px",
                        borderRadius: "30px",
                        backgroundColor: "var(--primary-glow)",
                        color: "var(--primary)",
                        border: "1px solid rgba(99, 102, 241, 0.15)",
                        fontSize: "13px",
                        fontWeight: "700"
                    }}>
                        <Sparkles size={14} />
                        Live Feed
                    </div>
                </motion.div>

                {/* Stats Grid */}
                {loading ? (
                    <p style={{ color: "var(--text-light)", fontStyle: "italic", textAlign: "left" }}>Loading metrics...</p>
                ) : (
                    <div className="stats-grid">
                        {statItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    className="stat-card"
                                    key={item.title}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -6, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div
                                        className="icon"
                                        style={{
                                            background: item.bg,
                                            color: item.color,
                                            width: "52px",
                                            height: "52px",
                                            borderRadius: "14px",
                                            border: `1px solid ${item.color}15`
                                        }}
                                    >
                                        <Icon size={24} />
                                    </div>
                                    <div style={{ textAlign: "left" }}>
                                        <h2 className="stat-number" style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>
                                            {item.value}
                                        </h2>
                                        <p className="stat-title" style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text-light)", fontWeight: "600" }}>
                                            {item.title}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Additional analytics card placeholder for visual completeness */}
                <motion.div
                    className="dashboard-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ padding: "30px", textAlign: "left" }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                        <BarChart3 size={20} color="var(--primary)" />
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>Capital Allocation Activity</h3>
                    </div>
                    <p style={{ color: "var(--text-light)", fontSize: "14px", margin: "0 0 20px 0" }}>
                        Below is the visual overview of your venture capital allocation. Connect with more startups to expand your deal flow.
                    </p>
                    
                    <div style={{
                        height: "120px",
                        borderRadius: "16px",
                        border: "1px dashed var(--border)",
                        background: "var(--bg)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-light)",
                        fontSize: "14px",
                        fontWeight: "600"
                    }}>
                        Visual allocation chart will render here as you make investments
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}