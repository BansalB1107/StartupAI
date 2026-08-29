import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User } from "lucide-react";
import { useParams } from 'react-router-dom';
import API from '../api';

// Facilitates real-time encrypted messaging between users by fetching history and polling for new messages.
const ChatComponent = ({ receiverId, receiverName }) => {
    const { other_user_id } = useParams();
    const targetUserId = receiverId || other_user_id;
    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState('');
    const messagesEndRef = useRef(null);

    const fetchMessages = async () => {
        if (!targetUserId) return;
        try {
            const res = await API.get(`messages/${targetUserId}/`);
            setMessages(res.data);
        } catch (err) { 
            console.error("Error fetching messages", err); 
        }
    };

    useEffect(() => {
        fetchMessages();
        // Set up polling for real-time feel (every 5 seconds)
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [targetUserId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!content.trim() || !targetUserId) return;
        try {
            await API.post('messages/send/', { receiver_id: targetUserId, content });
            setContent('');
            fetchMessages(); 
        } catch (err) {
            console.error("Error sending message", err);
        }
    };

    return (
        <div style={styles.chatContainer} className="glass-panel">
            {/* Chat Header */}
            <div style={styles.chatHeader}>
                <div style={styles.headerLeft}>
                    <div style={styles.avatar}>
                        {receiverName ? receiverName.charAt(0).toUpperCase() : <User size={20} />}
                        <div style={styles.activeDot} />
                    </div>
                    <div>
                        <h3 style={styles.headerName}>
                            {receiverName || "Secure Conversation"}
                        </h3>
                        <small style={styles.headerStatus}>
                            Encrypted chat session
                        </small>
                    </div>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div style={styles.messagesContainer}>
                {messages.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p style={{ margin: 0 }}>Start your conversation 👋</p>
                        <small style={{ color: "var(--text-light)", marginTop: "4px" }}>Send a message to begin collaborating.</small>
                    </div>
                ) : (
                    <div style={styles.messageList}>
                        <AnimatePresence>
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    style={{
                                        ...styles.messageRow,
                                        justifyContent: msg.is_sender ? "flex-end" : "flex-start",
                                    }}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div
                                        style={
                                            msg.is_sender
                                                ? styles.myMsg
                                                : styles.theirMsg
                                        }
                                    >
                                        <div style={styles.msgText}>{msg.content}</div>
                                        <div style={{
                                            ...styles.msgTime,
                                            color: msg.is_sender ? "rgba(255,255,255,0.7)" : "var(--text-light)"
                                        }}>
                                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Row */}
            <div style={styles.inputRow}>
                <input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type your message..."
                    style={styles.input}
                />
                <motion.button
                    onClick={sendMessage}
                    style={styles.sendBtn}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Send size={16} />
                </motion.button>
            </div>
        </div>
    );
};

const styles = {
    chatContainer: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        border: "1px solid var(--border-glass)",
        boxShadow: "var(--shadow)"
    },
    chatHeader: {
        padding: "16px 24px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface-glass)",
        backdropFilter: "blur(10px)"
    },
    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        textAlign: "left"
    },
    avatar: {
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        background: "var(--primary-glow)",
        color: "var(--primary)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "800",
        fontSize: "15px",
        position: "relative",
        border: "1px solid rgba(99, 102, 241, 0.1)"
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
    headerName: {
        margin: 0,
        fontSize: "15px",
        fontWeight: "800",
        color: "var(--text)"
    },
    headerStatus: {
        fontSize: "11px",
        color: "var(--text-light)"
    },
    messagesContainer: {
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        background: "transparent"
    },
    messageList: {
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },
    messageRow: {
        display: "flex",
        width: "100%"
    },
    emptyState: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "var(--text-light)",
        fontWeight: "600",
        fontSize: "14px"
    },
    myMsg: {
        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: "16px 16px 4px 16px",
        maxWidth: "70%",
        boxShadow: "0 4px 15px -4px var(--primary)",
        textAlign: "left"
    },
    theirMsg: {
        background: "var(--surface)",
        color: "var(--text)",
        border: "1px solid var(--border)",
        padding: "10px 16px",
        borderRadius: "16px 16px 16px 4px",
        maxWidth: "70%",
        textAlign: "left"
    },
    msgText: {
        fontSize: "14px",
        lineHeight: "1.5",
        wordBreak: "break-word"
    },
    msgTime: {
        fontSize: "10px",
        textAlign: "right",
        marginTop: "4px",
        fontWeight: "600"
    },
    inputRow: {
        display: "flex",
        gap: "12px",
        padding: "16px 20px",
        borderTop: "1px solid var(--border)",
        background: "var(--surface-glass)",
        backdropFilter: "blur(10px)"
    },
    input: {
        flex: 1,
        padding: "12px 18px",
        borderRadius: "24px",
        border: "1px solid var(--border)",
        outline: "none",
        fontSize: "14px",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--font-sans)"
    },
    sendBtn: {
        width: "44px",
        height: "44px",
        border: "none",
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "var(--shadow-glow)",
        flexShrink: 0
    }
};

export default ChatComponent;