import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../api';
import session from '../session';
import DashboardLayout from "./layout/DashboardLayout";
import ProfileForm from './ProfileForm';
import ConnectionManager from './ConnectionManager';
import PageHeader from "./common/PageHeader";
import StatsCards from "./dashboard/StatsCards";
import "../styles/dashboard.css";
import QuickActions from "./dashboard/QuickActions";
import DashboardHero from "./dashboard/DashboardHero";
import FundingProgress from "./dashboard/FundingProgress";
import FundingReadinessForm from "./dashboard/FundingReadinessForm";
import RecentReports from "./dashboard/RecentReports";
import UpgradeButton from './UpgradeButton';

// Orchestrates the main startup dashboard interface, integrating stats, profile details, and quick actions.
function StartupDashboard() {
    const [isVerified, setIsVerified] = useState(false);
    const [stats, setStats] = useState({
        investors: 0,
        messages: 0,
        funding_goal: 0,
        verified: false,
    });
    const navigate = useNavigate(); // 2. Initialize hook
    const location = useLocation();

    useEffect(() => {
        const fetchProfile = async () => {
            if (!session.get('access')) return;
            try {
                const res = await API.get('profile/');
                setIsVerified(res.data?.is_verified || false);
            } catch (err) {
                console.error("Could not fetch profile", err);
            }
        };
        fetchProfile();
        const loadStats = async () => {
            try {
                const res = await API.get("dashboard-stats/");
                setStats(res.data);
            } catch (err) {
                console.log(err);
            }
        };

        loadStats();
    }, []);

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

            <div style={styles.content}>

                <DashboardHero
                    isVerified={stats.verified}
                    badge="Verified Startup"
                    actionElement={<UpgradeButton />}
                />

                <div id="analytics-section">

                    <StatsCards
                        isVerified={stats.verified}
                        stats={stats}
                    />
                    <FundingProgress
                        stats={stats}
                    />

                </div>

                <QuickActions />

                <FundingReadinessForm />

                <RecentReports />

                <div className="bottom-grid">

                    <div id="profile-section">
                        <ProfileForm />
                    </div>

                    <ConnectionManager />

                </div>

            </div>
        </DashboardLayout>
    );
}

const styles = {
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },

    actionBlock: {
        display: 'flex',
        gap: '15px',
        marginTop: '25px',
    },

    button: {
        padding: '12px 22px',
        borderRadius: '10px',
        border: 'none',
        background: 'var(--primary)',
        color: '#fff',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '15px',
    },

    secondaryButton: {
        padding: '12px 22px',
        borderRadius: '10px',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        color: 'var(--text)',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '15px',
    },
};
export default StartupDashboard;