import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api";
import ChatComponent from "./ChatComponent";
import DashboardLayout from "./layout/DashboardLayout";
import {
    MessageSquare,
    ArrowLeft,
    User,
    ChevronRight,
    Compass,
    Sparkles
} from "lucide-react";

// Renders a secure dual-pane messaging interface for real-time communication between founders and verified investors.
function MessageHub() {
    const [connections, setConnections] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        API.get("connections/")
            .then((res) => {
                setConnections(res.data.filter(c => c.status === "accepted"));
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <DashboardLayout>
            <div className="dashboard-content" style={{ maxWidth: "1200px" }}>
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="dashboard-card"
                    style={styles.headerCard}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={styles.iconWrapper}>
                            <MessageSquare size={24} color="#fff" />
                        </div>
                        <div>
                            <h1 style={styles.heading}>Message Hub</h1>
                            <p style={styles.subheading}>Secure, real-time communications between founders and investors.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Splitscreen Chat Layout */}
                <div style={styles.splitscreenContainer}>
                    {/* Left Pane: Connections List */}
                    <div className="glass-panel" style={styles.leftPane}>
                        <div style={styles.paneHeader}>
                            <h3 style={styles.paneTitle}>Conversations</h3>
                            <span style={styles.badge}>
                                {connections.length} Active
                            </span>
                        </div>

                        <div style={styles.connectionsList}>
                            {loading ? (
                                <p style={styles.loadingText}>Loading contacts...</p>
                            ) : connections.length === 0 ? (
                                <div style={styles.emptyLeftPane}>
                                    <p>No active partners.</p>
                                    <small style={{ color: "var(--text-light)" }}>Accept a connection request to begin.</small>
                                </div>
                            ) : (
                                connections.map((c) => {
                                    const isSelected = selectedChat?.id === c.other_user.id;
                                    return (
                                        <motion.div
                                            key={c.id}
                                            style={{
                                                ...styles.connectionItem,
                                                backgroundColor: isSelected ? "var(--primary-glow)" : "transparent",
                                                borderColor: isSelected ? "var(--primary)" : "transparent"
                                            }}
                                            onClick={() => setSelectedChat({
                                                id: c.other_user.id,
                                                name: c.other_user.username,
                                            })}
                                            whileHover={{ x: 4, backgroundColor: isSelected ? "var(--primary-glow)" : "var(--surface-glass-hover)" }}
                                        >
                                            <div style={styles.avatar}>
                                                {c.other_user.username.charAt(0).toUpperCase()}
                                                <div style={styles.activeDot} />
                                            </div>
                                            <div style={styles.connectionDetails}>
                                                <h4 style={{
                                                    ...styles.connectionName,
                                                    color: isSelected ? "var(--primary)" : "var(--text)"
                                                }}>
                                                    {c.other_user.username}
                                                </h4>
                                                <p style={styles.connectionStatus}>Active now</p>
                                            </div>
                                            <ChevronRight size={16} style={{ color: isSelected ? "var(--primary)" : "var(--text-lighter)" }} />
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Pane: Active Chat Window */}
                    <div style={styles.rightPane}>
                        <AnimatePresence mode="wait">
                            {selectedChat ? (
                                <motion.div
                                    key={selectedChat.id}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.25 }}
                                    style={{ height: "100%" }}
                                >
                                    <ChatComponent
                                        receiverId={selectedChat.id}
                                        receiverName={selectedChat.name}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="glass-panel"
                                    style={styles.emptyChatState}
                                >
                                    <Compass size={48} style={{ color: "var(--text-lighter)", marginBottom: "16px" }} />
                                    <h3>Select a Conversation</h3>
                                    <p>Click on any connection from the left panel to open a secure workspace chat.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

const styles = {
    headerCard: {
        padding: "24px 30px",
        marginBottom: "24px",
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
    splitscreenContainer: {
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        gap: "24px",
        height: "600px",
        alignItems: "stretch"
    },
    leftPane: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden"
    },
    paneHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        borderBottom: "1px solid var(--border)"
    },
    paneTitle: {
        margin: 0,
        fontSize: "16px",
        fontWeight: "800",
        color: "var(--text)"
    },
    badge: {
        fontSize: "11px",
        fontWeight: "700",
        color: "var(--primary)",
        backgroundColor: "var(--primary-glow)",
        padding: "4px 10px",
        borderRadius: "20px",
        border: "1px solid rgba(99, 102, 241, 0.1)"
    },
    connectionsList: {
        flex: 1,
        overflowY: "auto",
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "6px"
    },
    loadingText: {
        color: "var(--text-light)",
        fontStyle: "italic",
        padding: "20px",
        fontSize: "14px"
    },
    emptyLeftPane: {
        padding: "40px 20px",
        textAlign: "center",
        fontSize: "14px",
        color: "var(--text-light)"
    },
    connectionItem: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px",
        borderRadius: "14px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        border: "1px solid transparent",
        textAlign: "left"
    },
    avatar: {
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "800",
        fontSize: "15px",
        position: "relative",
        boxShadow: "var(--shadow-sm)"
    },
    activeDot: {
        position: "absolute",
        bottom: "-2px",
        right: "-2px",
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: "var(--success)",
        border: "2px solid var(--surface)"
    },
    connectionDetails: {
        flex: 1,
        minWidth: 0
    },
    connectionName: {
        margin: 0,
        fontSize: "14px",
        fontWeight: "700",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    connectionStatus: {
        margin: "2px 0 0 0",
        fontSize: "11px",
        color: "var(--text-light)"
    },
    rightPane: {
        height: "100%"
    },
    emptyChatState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "40px",
        textAlign: "center",
        color: "var(--text-light)"
    }
};

export default MessageHub;