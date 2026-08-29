import React, { useState, useEffect } from "react";
import API from "../api";

import DashboardHero from "./admin/DashboardHero";
import StatsGrid from "./admin/StatsGrid";
import PendingVerificationTable from "./admin/PendingVerificationTable";
import RecentActivity from "./admin/RecentActivity";
import AnalyticsCharts from "./admin/AnalyticsCharts";
import UserTable from "./admin/UserTable";
import QuickActions from "./admin/QuickActions";

import "../styles/admin-dashboard.css";

// Primary administrator dashboard interface aggregating platform statistics, user management tools, and verification controls.
function AdminDashboard() {
    const [loading, setLoading] = useState(false);

    const [pendingStartups, setPendingStartups] = useState([]);

    const [stats, setStats] = useState({
        users: 0,
        startups: 0,
        investors: 0,
        admins: 0,
        pending: 0,
        investments: 0,
        messages: 0,
        notifications: 0,
    });

    // -------------------------------
    // Fetch Dashboard Stats
    // -------------------------------
    // Fetches and updates comprehensive aggregate dashboard metrics for administrative oversight.
    const fetchStats = async () => {
        try {
            const res = await API.get("admin-dashboard-stats/");
            setStats(res.data);
        } catch (err) {
            console.error("Error fetching dashboard stats", err);
        }
    };

    // -------------------------------
    // Fetch Pending Startups
    // -------------------------------
    // Retrieves the current list of unverified startup profiles requiring administrative approval.
    const fetchPending = async () => {
        setLoading(true);

        try {
            const res = await API.get("admin-verify/");
            setPendingStartups(res.data);
        } catch (err) {
            console.error("Error fetching pending startups", err);
        } finally {
            setLoading(false);
        }
    };

    // -------------------------------
    // Approve Startup
    // -------------------------------
    // Approves a pending startup profile securely and refreshes dashboard verification lists.
    const handleApprove = async (profileId) => {
        try {

            await API.post("admin-verify/", {
                profile_id: profileId,
            });

            setPendingStartups((prev) =>
                prev.filter((item) => item.id !== profileId)
            );

            fetchStats();

        } catch (err) {
            console.error("Error approving startup", err);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchPending();
    }, []);

    return (
        <div className="admin-dashboard">

            <DashboardHero />

            <StatsGrid stats={stats} />

            <QuickActions />

            {loading ? (
                <div className="loading-card">
                    Loading Dashboard...
                </div>
            ) : (
                <PendingVerificationTable
                    startups={pendingStartups}
                    onApprove={handleApprove}
                />
            )}

            <AnalyticsCharts />

            <RecentActivity />

            <UserTable />

        </div>
    );
}

export default AdminDashboard;