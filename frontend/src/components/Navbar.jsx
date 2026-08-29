import React, { useState, useEffect, useContext } from 'react';
import ThemeContext from "../theme/ThemeContext";
import { useNavigate } from 'react-router-dom';
import API from '../api';
import session from '../session';

// Renders the global application navigation bar supporting theme toggling, user role badges, notifications, and secure logout.
function Navbar() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const userRole = session.get('user_role') || 'user';
    const username = session.get('username') || '';

    const getBadgeStyle = () => {
        if (userRole === 'investor') return { ...styles.badge, backgroundColor: '#007bff' };
        if (userRole === 'admin') return { ...styles.badge, backgroundColor: '#dc3545' };
        return { ...styles.badge, backgroundColor: '#28a745' };
    };

    const handleLogout = () => {
        session.remove('access');
        session.remove('refresh');
        session.remove('user_role');
        navigate('/login');
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.logoGroup}>
                <span style={styles.logoIcon}>💡</span>
                <h1 style={styles.logoText}>StartupAI</h1>
            </div>

            <div style={styles.userGroup}>
                {/* --- NEW: AI Strategy Link for Startups --- */}

                <button
                    onClick={toggleTheme}
                    style={styles.themeButton}
                >
                    {theme === "light" ? "🌙" : "☀️"}
                </button>

                <NotificationBadge />

                <span style={getBadgeStyle()}>
                    {userRole.toUpperCase()}
                </span>
                
                {username && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'var(--primary)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 'bold', fontSize: '14px'
                        }}>
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '600', color: 'var(--text)' }}>
                            {username}
                        </span>
                    </div>
                )}

                <button onClick={handleLogout} style={styles.logoutBtn}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

// Displays a real-time updating notification badge icon linked to the user's secure alerts center.
const NotificationBadge = () => {

    const [count, setCount] = useState(0);
    const navigate = useNavigate();

    const fetchCount = async () => {

        try {

            const res = await API.get("notifications/count/");
            setCount(res.data.count || 0);

        } catch (err) {

            console.error(err);

        }

    };

    useEffect(() => {

        fetchCount();

        const interval = setInterval(fetchCount, 10000);

        return () => clearInterval(interval);

    }, []);

    return (

        <div
            onClick={() => navigate("/notifications")}
            style={{
                position: "relative",
                cursor: "pointer",
                fontSize: "23px",
            }}
        >

            🔔

            {

                count > 0 &&

                <span
                    style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-10px",
                        background: "#ef4444",
                        color: "#fff",
                        borderRadius: "50%",
                        minWidth: "20px",
                        height: "20px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "11px",
                        fontWeight: "700",
                    }}
                >
                    {count}
                </span>

            }

        </div>

    );

};

const styles = {
    navbar: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,

        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',

        padding: '14px 32px',

        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',

        boxShadow: '0 5px 18px var(--shadow)',

        zIndex: 999,
    },
    logoGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
    logoIcon: { fontSize: '20px' },
    logoText: {
        fontSize: '22px',
        margin: 0,
        color: 'var(--text)',
        fontWeight: '700',
    },    // ... keep your existing logoGroup ...
    userGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px' // Increased gap for better spacing
    },
    notificationContainer: {
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg)',
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--text)',
        cursor: 'pointer'
    },
    badge: {
        color: '#fff',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    logoutBtn: {
        padding: '10px 18px',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        color: 'var(--text)',
        cursor: 'pointer',
        fontWeight: '600',
        transition: '0.25s',
    },
    navLink: {
        marginRight: '15px',
        background: 'none',
        border: 'none',
        color: "var(--text)",
        cursor: 'pointer',
        fontWeight: 'bold'
    },
    themeButton: {
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        color: 'var(--text)',
        cursor: 'pointer',
        fontSize: '18px',
    },
};

export default Navbar;