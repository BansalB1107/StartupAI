import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import DashboardLayout from "./layout/DashboardLayout";
import DashboardHero from "./dashboard/DashboardHero";
import InvestorStats from "./dashboard/InvestorStats";
import "../styles/investor.css";

import WalletManager from "./WalletManager";
import InvestorProfileForm from "./InvestorProfileForm";
import InvestorQuickActions from "./dashboard/InvestorQuickActions";

import API from "../api";
import session from '../session';



// Primary investor workspace integrating portfolio statistics, wallet management, profile settings, and discovery tools.
function InvestorDashboard() {
    const [stats, setStats] = useState({
        wallet: 0,
        startups: 0,
        messages: 0,
        connections: 0,
    });
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!session.get('access')) {
            navigate('/login');
            return;
        }

        const loadStats = async () => {
            try {
                const res = await API.get("dashboard-stats/");
                setStats(res.data);
            } catch (err) {
                console.log(err);
            }
        };

        loadStats();
    }, [navigate]);

    useEffect(() => {

        const id = location.hash.replace("#", "");

        if (id) {

            document
                .getElementById(id)
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

        }

    }, [location]);

    return (
        <DashboardLayout>

            {/* Hero */}
            <DashboardHero
                title="Investor Dashboard"
                subtitle="Discover promising startups and manage your investments."
                isVerified={stats.verified}
                badge="Verified Investor"
            />

            {/* Statistics */}
            <div id="analytics-section">
                <InvestorStats stats={stats} />
            </div>

            {/* Quick Actions */}
            <InvestorQuickActions />

            {/* Main Dashboard Layout */}
            <div className="investor-grid">

                {/* Left Column */}
                <div className="left-column">

                    <div className="dashboard-card">
                        <WalletManager />
                    </div>

                </div>

                {/* Right Column */}
                <div
                    className="right-column"
                    id="profile-section"
                >

                    <div className="dashboard-card">
                        <InvestorProfileForm />
                    </div>

                </div>

            </div>

        </DashboardLayout>
    );



}



const walletStyles = {
    walletCard: { background: '#fff', padding: '30px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '100%', marginTop: '10px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    walletBadge: { backgroundColor: '#def7ec', color: '#03543f', fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '20px' },
    balanceContainer: { background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' },
    balanceLabel: { fontSize: '11px', color: '#64748b', fontWeight: 'bold', letterSpacing: '0.05em' },
    balanceValue: { fontSize: '32px', margin: '5px 0', color: '#0f172a', fontWeight: '800' },
    referralHint: { fontSize: '13px', color: '#475569', margin: '5px 0 0 0' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' },
    actionColumn: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#475569' },
    input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' },
    buttonRow: { display: 'flex', gap: '10px' },
    depositBtn: { flex: 1, padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    withdrawBtn: { flex: 1, padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    referralBtn: { padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
    successBox: { backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px' },
    errorBox: { backgroundColor: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px' }
};

const styles = {
    content: { padding: '40px', display: 'flex', flexDirection: 'column', gap: '25px' },
    card: { background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', width: '100%' },
    pitchCard: { background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', position: 'relative' },
    badge: { position: 'absolute', top: '20px', right: '20px', background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
    companyTitle: { margin: '0 0 10px 0', fontSize: '20px', color: '#111827' },
    description: { color: '#4b5563', fontSize: '14px', lineHeight: '1.5', flexGrow: 1, marginBottom: '20px' },
    fundingZone: { borderTop: '1px solid #e5e7eb', paddingTop: '15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    fundingLabel: { fontSize: '13px', color: '#6b7280' },
    fundingAmount: { fontSize: '18px', fontWeight: 'bold', color: '#2563eb' },
    connectButton: { width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' },
    pendingBtn: { width: '100%', padding: '10px', background: '#eab308', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'not-allowed' },
    connectedBtn: { width: '100%', padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'not-allowed' },
    declinedBtn: { width: '100%', padding: '10px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'not-allowed' },
    errorBanner: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', border: '1px solid #fca5a5' }
};

export default InvestorDashboard;