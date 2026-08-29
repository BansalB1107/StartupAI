import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Calendar, Inbox, CheckCircle2, MessageSquare, Award } from "lucide-react";
import DashboardLayout from "./layout/DashboardLayout";
import API from "../api";

// Renders a centralized notification center displaying categorized alerts for connection requests, messages, and platform updates.
export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        API.get("notifications/")
            .then((res) => {

                console.log("NOTIFICATION RESPONSE:", res.data);

                setNotifications(res.data.notifications || []);
                setLoading(false);

            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);


    const markAllRead = async () => {

        try {

            await API.post("notifications/");

            setNotifications(prev =>
                prev.map(n => ({
                    ...n,
                    is_read: true,
                }))
            );

        } catch (err) {

            console.error(err);

        }

    };

    const acceptInvestment = async (investmentId) => {
        try {
            await API.post(`investments/${investmentId}/accept/`);

            setNotifications(prev =>
                prev.filter(n => n.investment_id !== investmentId)
            );

            alert("Investment accepted.");
        } catch (err) {
            console.error(err);
            alert("Failed to accept investment.");
        }
    };

    const rejectInvestment = async (investmentId) => {
        try {
            await API.post(`investments/${investmentId}/reject/`);

            setNotifications(prev =>
                prev.filter(n => n.investment_id !== investmentId)
            );

            alert("Investment rejected.");
        } catch (err) {
            console.error(err);
            alert("Failed to reject investment.");
        }
    };


    const clearAll = async () => {

        if (!window.confirm("Clear all notifications?"))
            return;

        try {

            await API.delete("notifications/");

            setNotifications([]);

        } catch (err) {

            console.error(err);

        }

    };

    // Helper to render type-specific icons and colors
    const getNotificationStyle = (type) => {

        switch (type) {

            case "investment":
                return {
                    icon: Award,
                    color: "#10b981",
                    bg: "#10b98120",
                };

            case "message":
                return {
                    icon: MessageSquare,
                    color: "#3b82f6",
                    bg: "#3b82f620",
                };

            case "connection_request":
            case "connection_accepted":
                return {
                    icon: Bell,
                    color: "#f59e0b",
                    bg: "#f59e0b20",
                };

            default:
                return {
                    icon: Bell,
                    color: "var(--primary)",
                    bg: "var(--primary-glow)",
                };

        }

    };

    return (
        <DashboardLayout>
            <div className="dashboard-content" style={{ maxWidth: "800px" }}>
                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="dashboard-card"
                    style={styles.headerCard}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={styles.iconWrapper}>
                            <Bell size={24} color="#fff" />
                        </div>
                        <div>
                            <h1 style={styles.heading}>Notification Center</h1>
                            <p style={styles.subheading}>Stay updated with your connection requests, messages, and funding updates.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Notifications List Card */}
                <div className="dashboard-card" style={{ padding: "30px", textAlign: "left" }}>
                    <h2 style={styles.listTitle}>
                        All Notifications
                    </h2>

                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                        }}
                    >

                        <button
                            className="connect-btn"
                            style={{
                                width: "auto",
                                padding: "8px 15px",
                            }}
                            onClick={markAllRead}
                        >
                            ✓ Mark Read
                        </button>

                        <button
                            className="declined-btn"
                            style={{
                                width: "auto",
                                padding: "8px 15px",
                            }}
                            onClick={clearAll}
                        >
                            🗑 Clear
                        </button>

                        <span style={styles.badge}>
                            {notifications.length}
                        </span>

                    </div>

                    <div style={styles.notificationsList}>
                        {loading ? (
                            <p style={{ color: "var(--text-light)", fontStyle: "italic" }}>Loading notifications...</p>
                        ) : notifications.length === 0 ? (
                            <div style={styles.emptyState}>
                                <Inbox size={48} style={{ color: "var(--text-lighter)", marginBottom: "16px" }} />
                                <h3>All caught up!</h3>
                                <p>You have no new notifications. We'll let you know when something important happens.</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {notifications.map((item, index) => {
                                    const {
                                        icon: IconComponent,
                                        color,
                                        bg,
                                    } = getNotificationStyle(item.type);
                                    return (
                                        <motion.div

                                            onClick={() => {

                                                if (item.redirect_url)
                                                    navigate(item.redirect_url);

                                            }}

                                            style={{
                                                ...styles.notificationItem,
                                                cursor: "pointer",
                                                opacity: item.is_read ? 0.7 : 1,
                                            }}
                                            key={item.id || index}
                                            initial={{ opacity: 0, x: -15 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            whileHover={{ x: 4, backgroundColor: "var(--surface-glass-hover)" }}
                                        >
                                            <div style={{ ...styles.notificationIcon, backgroundColor: bg, color: color }}>
                                                <IconComponent size={20} />
                                            </div>
                                            <div style={styles.notificationDetails}>
                                                <p style={styles.notificationMessage}><strong>

                                                    {item.title}

                                                </strong>

                                                    <br />

                                                    {item.message}</p>
                                                {

                                                    !item.is_read &&

                                                    <div
                                                        style={{
                                                            width: 10,
                                                            height: 10,
                                                            borderRadius: "50%",
                                                            background: "#10b981",
                                                            marginTop: 16,
                                                        }}
                                                    />

                                                }
                                                {item.type === "investment" && item.investment_id && (
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: "10px",
                                                            marginTop: "12px",
                                                        }}
                                                    >
                                                        <button
                                                            className="connect-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                acceptInvestment(item.investment_id);
                                                            }}
                                                        >
                                                            Accept
                                                        </button>

                                                        <button
                                                            className="declined-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                rejectInvestment(item.investment_id);
                                                            }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                <div style={styles.notificationTimeRow}>
                                                    <Calendar size={12} style={{ marginRight: "4px" }} />
                                                    <span>{item.time || "Just now"}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

const styles = {
    headerCard: {
        padding: "28px 30px",
        marginBottom: "32px",
        textAlign: "left"
    },
    iconWrapper: {
        width: "48px",
        height: "48px",
        borderRadius: "14px",
        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "var(--shadow-glow)",
        flexShrink: 0
    },
    heading: {
        fontSize: "22px",
        fontWeight: "800",
        margin: "0 0 4px 0",
        letterSpacing: "-0.5px"
    },
    subheading: {
        fontSize: "13px",
        color: "var(--text-light)",
        margin: 0
    },
    listHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        borderBottom: "1px solid var(--border)",
        paddingBottom: "16px"
    },
    listTitle: {
        margin: 0,
        fontSize: "18px",
        fontWeight: "800"
    },
    badge: {
        fontSize: "11px",
        fontWeight: "700",
        color: "var(--text-light)",
        backgroundColor: "var(--bg)",
        padding: "4px 10px",
        borderRadius: "20px",
        border: "1px solid var(--border)"
    },
    notificationsList: {
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },
    notificationItem: {
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
        padding: "16px",
        borderRadius: "14px",
        border: "1px solid var(--border)",
        background: "var(--surface-glass)",
        transition: "all 0.2s ease"
    },
    notificationIcon: {
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0
    },
    notificationDetails: {
        flex: 1,
        minWidth: 0,
        textAlign: "left"
    },
    notificationMessage: {
        margin: 0,
        fontSize: "14px",
        fontWeight: "600",
        color: "var(--text)",
        lineHeight: "1.5"
    },
    notificationTimeRow: {
        display: "flex",
        alignItems: "center",
        marginTop: "8px",
        fontSize: "11px",
        color: "var(--text-light)"
    },
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        textAlign: "center",
        color: "var(--text-light)"
    }
};