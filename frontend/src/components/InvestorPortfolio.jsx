import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Briefcase,
    Users,
    TrendingUp,
    MessageCircle,
    Calendar,
    Coins,
    Award
} from "lucide-react";
import DashboardLayout from "./layout/DashboardLayout";
import API from "../api";

// Renders a comprehensive portfolio tracking dashboard for investors to monitor their active equity holdings.
export default function InvestorPortfolio() {
    const [portfolio, setPortfolio] = useState({
        total_invested: 0,
        investment_count: 0,
        investments: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("portfolio/")
            .then((res) => {
                setPortfolio(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const statItems = [
        {
            title: "Active Investments",
            value: portfolio.investment_count,
            icon: Briefcase,
            color: "var(--primary)",
            bg: "var(--primary-glow)"
        },
        {
            title: "Total Capital Invested",
            value: `₹${Number(portfolio.total_invested).toLocaleString("en-IN")}`,
            icon: TrendingUp,
            color: "var(--success)",
            bg: "var(--success-glow)"
        },
        {
            title: "Partner Startups",
            value: portfolio.investment_count,
            icon: Users,
            color: "var(--secondary)",
            bg: "var(--secondary-glow)"
        },
        {
            title: "Deal Collaborations",
            value: portfolio.investment_count,
            icon: MessageCircle,
            color: "var(--warning)",
            bg: "var(--warning-glow)"
        }
    ];

    return (
        <DashboardLayout>
            <div className="dashboard-content">
                {/* Header Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="dashboard-card"
                >
                    <h1 style={{ margin: "0 0 6px 0", fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                        💼 Investment Portfolio
                    </h1>
                    <p style={{ margin: 0, color: "var(--text-light)", fontSize: "14px" }}>
                        Monitor your equity holdings, capital deployments, and active venture partnerships.
                    </p>
                </motion.div>

                {/* Stats Grid */}
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
                                <div>
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

                {/* Investments Marketplace Grid */}
                <div className="dashboard-card" style={{ padding: "30px", textAlign: "left" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "800", margin: "0 0 24px 0" }}>Asset Holdings</h2>

                    {loading ? (
                        <p style={{ color: "var(--text-light)", fontStyle: "italic" }}>Loading your assets...</p>
                    ) : portfolio.investments.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px 20px" }}>
                            <Briefcase size={40} style={{ color: "var(--text-lighter)", marginBottom: "12px" }} />
                            <h3 style={{ margin: "0 0 8px 0" }}>No Active Stakes</h3>
                            <p style={{ margin: 0, color: "var(--text-light)" }}>Explore the startup marketplace to deploy capital and build your portfolio.</p>
                        </div>
                    ) : (
                        <div className="marketplace-grid">
                            {portfolio.investments.map((investment, index) => (
                                <motion.div
                                    key={investment.id}
                                    className="startup-card"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="card-top">
                                        <span className="industry-badge" style={{ background: "var(--success-glow)", color: "var(--success)", borderColor: "rgba(16, 185, 129, 0.15)" }}>
                                            Equity Stake
                                        </span>
                                        <span className="status-badge" style={{ background: "var(--primary-glow)", color: "var(--primary)", borderColor: "rgba(99, 102, 241, 0.15)" }}>
                                            Active
                                        </span>
                                    </div>

                                    <h3 className="company-name" style={{ fontSize: "20px", fontWeight: "800", margin: "8px 0 12px 0" }}>
                                        {investment.startup_name}
                                    </h3>

                                    <div style={styles.detailRow}>
                                        <div style={styles.detailItem}>
                                            <Coins size={16} style={styles.detailIcon} />
                                            <div>
                                                <span style={styles.detailLabel}>Capital Committed</span>
                                                <h4 style={styles.detailValue}>
                                                    ₹{Number(investment.amount).toLocaleString("en-IN")}
                                                </h4>
                                            </div>
                                        </div>

                                        <div style={styles.detailItem}>
                                            <Calendar size={16} style={styles.detailIcon} />
                                            <div>
                                                <span style={styles.detailLabel}>Acquisition Date</span>
                                                <h4 style={styles.detailValue}>
                                                    {new Date(investment.created_at).toLocaleDateString("en-IN", {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: "12px" }}>
                                        <button
                                            className="connected-btn"
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "6px",
                                                padding: "10px",
                                                fontSize: "13px"
                                            }}
                                            disabled
                                        >
                                            <Award size={16} />
                                            Position Active
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

const styles = {
    detailRow: {
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        background: "rgba(99, 102, 241, 0.03)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "16px",
        margin: "8px 0"
    },
    detailItem: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        textAlign: "left"
    },
    detailIcon: {
        color: "var(--text-light)",
        flexShrink: 0
    },
    detailLabel: {
        fontSize: "11px",
        color: "var(--text-light)",
        fontWeight: "600",
        display: "block",
        lineHeight: "1"
    },
    detailValue: {
        fontSize: "14px",
        fontWeight: "700",
        color: "var(--text)",
        margin: "4px 0 0 0",
        lineHeight: "1"
    }
};