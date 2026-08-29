import {
    Users,
    MessageCircle,
    Wallet,
    TrendingUp,
} from "lucide-react";

import StatCard from "../common/StatCard";

// Retrieves and renders a grid of core startup performance metrics utilizing reusable animated statistic components.
export default function StatsCards({ stats }) {

    return (

        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
                gap: "20px",
                marginBottom: "35px",
            }}
        >

            <StatCard
                title="Investors"
                value={stats.investors}
                color="#3B82F6"
                icon={<Users size={28} />}
            />

            <StatCard
                title="Messages"
                value={stats.messages}
                color="#3B82F6"
                icon={<MessageCircle size={28} />}
            />

            <StatCard
                title="Raised"
                value={`₹${Number(
                    stats.raised_amount || 0
                ).toLocaleString("en-IN")}`}
                color="#10B981"
                icon={<Wallet size={28} />}
            />

            <StatCard
                title="Funding Progress"
                value={`${stats.progress || 0}%`}
                color="#F59E0B"
                icon={<TrendingUp size={28} />}
            />

        </div>

    );

}