import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Wallet, 
    Target, 
    Users, 
    TrendingUp, 
    Calendar,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    DollarSign
} from "lucide-react";
import DashboardLayout from "./layout/DashboardLayout";
import API from "../api";

// Renders a comprehensive funding dashboard tracking campaign progress, investor contributions, and financial metrics.
export default function StartupFunding() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("funding/")
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="dashboard-content" style={styles.loaderContainer}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                        <Wallet size={36} color="var(--primary)" />
                    </motion.div>
                    <p style={{ marginTop: "16px", fontWeight: "600", color: "var(--text-light)" }}>
                        Loading funding ledger...
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    if (!data) {
        return (
            <DashboardLayout>
                <div className="dashboard-content">
                    <div className="dashboard-card" style={{ textAlign: "center", padding: "40px" }}>
                        <h2 style={{ color: "var(--error)" }}>Error Loading Funding Data</h2>
                        <p>Could not retrieve fundraising information. Please check your network connection.</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const percentage = data.funding_goal > 0 ? (data.raised_amount / data.funding_goal) * 100 : 0;

    let status = "Getting Started";
    let statusColor = "var(--primary)";
    let statusBg = "var(--primary-glow)";

    if (percentage >= 30) {
        status = "🟢 On Track";
        statusColor = "var(--success)";
        statusBg = "var(--success-glow)";
    }

    if (percentage >= 100) {
        status = "🏆 Goal Achieved";
        statusColor = "var(--secondary)";
        statusBg = "var(--secondary-glow)";
    }

    const statItems = [
        {
            title: "Funding Goal",
            value: `₹${Number(data.funding_goal).toLocaleString("en-IN")}`,
            icon: Target,
            color: "var(--primary)",
            bg: "var(--primary-glow)"
        },
        {
            title: "Total Raised",
            value: `₹${Number(data.raised_amount).toLocaleString("en-IN")}`,
            icon: Wallet,
            color: "var(--success)",
            bg: "var(--success-glow)"
        },
        {
            title: "Remaining",
            value: `₹${Number(data.remaining).toLocaleString("en-IN")}`,
            icon: TrendingUp,
            color: "var(--warning)",
            bg: "var(--warning-glow)"
        },
        {
            title: "Total Investors",
            value: data.investors,
            icon: Users,
            color: "var(--secondary)",
            bg: "var(--secondary-glow)"
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
                    style={styles.headerCard}
                >
                    <div>
                        <h1 style={styles.heading}>Funding Dashboard</h1>
                        <p style={styles.subheading}>
                            Track your fundraising campaigns, monitor investor contributions, and manage capital growth.
                        </p>
                    </div>
                    <div style={{
                        ...styles.statusBadge,
                        color: statusColor,
                        backgroundColor: statusBg,
                        borderColor: `${statusColor}20`
                    }}>
                        {status}
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div style={styles.statsGrid}>
                    {statItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.title}
                                className="glass-panel"
                                style={styles.statCard}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -6, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div style={{ ...styles.iconWrapper, backgroundColor: item.bg, color: item.color }}>
                                    <Icon size={24} />
                                </div>
                                <div style={styles.statInfo}>
                                    <h3 style={styles.statValue}>{item.value}</h3>
                                    <p style={styles.statLabel}>{item.title}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Main Content Layout */}
                <div style={styles.contentLayout}>
                    {/* Left: Funding Progress Bar & Details */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="dashboard-card"
                        style={styles.progressCard}
                    >
                        <div style={styles.cardHeader}>
                            <h2>Campaign Progress</h2>
                            <span style={{ color: "var(--success)", fontWeight: "800", fontSize: "20px" }}>
                                {percentage.toFixed(1)}%
                            </span>
                        </div>

                        <div style={styles.progressBarBg}>
                            <motion.div
                                style={{
                                    ...styles.progressBarFill,
                                    width: `${Math.min(percentage, 100)}%`,
                                }}
                                initial={{ width: "0%" }}
                                animate={{ width: `${Math.min(percentage, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>

                        <div style={styles.progressLabels}>
                            <div>
                                <span style={styles.progressAmountText}>
                                    ₹{Number(data.raised_amount).toLocaleString("en-IN")}
                                </span>
                                <span style={styles.progressLabelText}> Raised</span>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <span style={styles.progressAmountText}>
                                    ₹{Number(data.funding_goal).toLocaleString("en-IN")}
                                </span>
                                <span style={styles.progressLabelText}> Target Goal</span>
                            </div>
                        </div>

                        <div style={styles.progressDetailsGrid}>
                            <div style={styles.progressDetailItem}>
                                <span style={styles.detailLabel}>Average Ticket Size</span>
                                <span style={styles.detailValue}>
                                    ₹{data.investors > 0 ? Number(Math.round(data.raised_amount / data.investors)).toLocaleString("en-IN") : "0"}
                                </span>
                            </div>
                            <div style={styles.progressDetailItem}>
                                <span style={styles.detailLabel}>Days Remaining</span>
                                <span style={styles.detailValue}>24 Days</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Recent Transactions ledger */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="dashboard-card"
                        style={styles.historyCard}
                    >
                        <div style={styles.cardHeader}>
                            <h2>Recent Capital Inflow</h2>
                            <span style={styles.transactionCount}>
                                {data.history.length} Transaction{data.history.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        <div style={styles.historyList}>
                            <AnimatePresence>
                                {data.history.length === 0 ? (
                                    <div style={styles.emptyHistory}>
                                        <h3>No Contributions Yet</h3>
                                        <p>Your pitch is currently open. Share your startup profile to start raising capital.</p>
                                    </div>
                                ) : (
                                    data.history.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            style={styles.historyItem}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ x: 4, backgroundColor: "var(--surface-glass-hover)" }}
                                        >
                                            <div style={styles.historyLeft}>
                                                <div style={styles.investorAvatar}>
                                                    {item.investor.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 style={styles.investorName}>{item.investor}</h4>
                                                    <p style={styles.investorTime}>
                                                        <Calendar size={12} style={{ marginRight: '4px' }} />
                                                        {item.time}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={styles.historyRight}>
                                                <span style={styles.historyAmount}>
                                                    + ₹{Number(item.amount).toLocaleString("en-IN")}
                                                </span>
                                                <span style={styles.historyStatus}>
                                                    <ArrowUpRight size={12} style={{ marginRight: '2px' }} />
                                                    Success
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}

const styles = {
    loaderContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh"
    },
    headerCard: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px",
        padding: "32px",
        marginBottom: "32px"
    },
    heading: {
        fontSize: "26px",
        fontWeight: "800",
        margin: "0 0 6px 0",
        letterSpacing: "-0.5px"
    },
    subheading: {
        fontSize: "14px",
        color: "var(--text-light)",
        margin: 0,
        maxWidth: "600px"
    },
    statusBadge: {
        padding: "8px 16px",
        borderRadius: "30px",
        fontWeight: "700",
        fontSize: "13px",
        border: "1px solid transparent"
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "24px",
        marginBottom: "32px"
    },
    statCard: {
        display: "flex",
        alignItems: "center",
        gap: "18px",
        padding: "24px",
        textAlign: "left"
    },
    iconWrapper: {
        width: "52px",
        height: "52px",
        borderRadius: "14px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0
    },
    statInfo: {
        display: "flex",
        flexDirection: "column"
    },
    statValue: {
        margin: 0,
        fontSize: "22px",
        fontWeight: "800",
        color: "var(--text)",
        lineHeight: "1.2"
    },
    statLabel: {
        margin: "4px 0 0 0",
        fontSize: "13px",
        fontWeight: "600",
        color: "var(--text-light)",
        lineHeight: "1"
    },
    contentLayout: {
        display: "grid",
        gridTemplateColumns: "1.1fr 0.9fr",
        gap: "32px",
        alignItems: "start"
    },
    progressCard: {
        padding: "30px",
        textAlign: "left"
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
    },
    progressBarBg: {
        width: "100%",
        height: "14px",
        borderRadius: "99px",
        background: "var(--border)",
        overflow: "hidden",
        marginBottom: "16px"
    },
    progressBarFill: {
        height: "100%",
        background: "linear-gradient(90deg, var(--primary), var(--secondary))",
        borderRadius: "99px"
    },
    progressLabels: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "28px"
    },
    progressAmountText: {
        fontSize: "15px",
        fontWeight: "800",
        color: "var(--text)"
    },
    progressLabelText: {
        fontSize: "13px",
        color: "var(--text-light)"
    },
    progressDetailsGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
        borderTop: "1px solid var(--border)",
        paddingTop: "24px"
    },
    progressDetailItem: {
        display: "flex",
        flexDirection: "column",
        gap: "6px"
    },
    detailLabel: {
        fontSize: "12px",
        color: "var(--text-light)",
        fontWeight: "600"
    },
    detailValue: {
        fontSize: "18px",
        fontWeight: "800",
        color: "var(--text)"
    },
    historyCard: {
        padding: "30px",
        textAlign: "left"
    },
    transactionCount: {
        fontSize: "12px",
        fontWeight: "700",
        color: "var(--text-light)",
        backgroundColor: "var(--bg)",
        padding: "4px 10px",
        borderRadius: "20px",
        border: "1px solid var(--border)"
    },
    historyList: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        maxHeight: "360px",
        overflowY: "auto",
        paddingRight: "6px"
    },
    emptyHistory: {
        textAlign: "center",
        padding: "60px 20px"
    },
    historyItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 16px",
        borderRadius: "14px",
        border: "1px solid var(--border)",
        background: "var(--surface-glass)",
        transition: "all 0.2s ease"
    },
    historyLeft: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },
    investorAvatar: {
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        background: "var(--primary-glow)",
        color: "var(--primary)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "800",
        fontSize: "16px",
        border: "1px solid rgba(99, 102, 241, 0.1)"
    },
    investorName: {
        margin: 0,
        fontSize: "14px",
        fontWeight: "700",
        color: "var(--text)"
    },
    investorTime: {
        margin: "2px 0 0 0",
        fontSize: "11px",
        color: "var(--text-light)",
        display: "flex",
        alignItems: "center"
    },
    historyRight: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end"
    },
    historyAmount: {
        fontSize: "16px",
        fontWeight: "800",
        color: "var(--success)"
    },
    historyStatus: {
        fontSize: "11px",
        fontWeight: "700",
        color: "var(--success)",
        display: "flex",
        alignItems: "center",
        marginTop: "2px"
    }
};