import {
    Users,
    Rocket,
    Briefcase,
    Clock3,
    IndianRupee,
    MessageSquare,
    Bell,
    ShieldCheck
} from "lucide-react";

import StatCard from "./StatCard";

// Renders a comprehensive grid of statistic cards summarizing crucial platform metrics for administrative oversight.
const StatsGrid = ({ stats }) => {

    return (

        <div className="stats-grid">

            <StatCard
                title="Total Users"
                value={stats.users}
                icon={Users}
                color="#2563eb"
            />

            <StatCard
                title="Startups"
                value={stats.startups}
                icon={Rocket}
                color="#3B82F6"
            />

            <StatCard
                title="Investors"
                value={stats.investors}
                icon={Briefcase}
                color="#0ea5e9"
            />

            <StatCard
                title="Pending"
                value={stats.pending}
                icon={Clock3}
                color="#f59e0b"
            />

            <StatCard
                title="Funding"
                value={stats.investments}
                icon={IndianRupee}
                color="#22c55e"
            />

            <StatCard
                title="Messages"
                value={stats.messages}
                icon={MessageSquare}
                color="#3B82F6"
            />

            <StatCard
                title="Notifications"
                value={stats.notifications}
                icon={Bell}
                color="#ef4444"
            />

            <StatCard
                title="Admins"
                value={stats.admins}
                icon={ShieldCheck}
                color="#14b8a6"
            />

        </div>

    );

};

export default StatsGrid;