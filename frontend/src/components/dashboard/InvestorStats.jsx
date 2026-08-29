import React from "react";
import { motion } from "framer-motion";
import { Wallet, Building2, MessageSquare, Users } from "lucide-react";

// Renders a grid of animated statistical cards summarizing key investor metrics like wallet balances dynamically.
export default function InvestorStats({ stats }) {
    const statCards = [
        {
            title: "Wallet Balance",
            value: `₹${Number(stats?.wallet || 0).toLocaleString("en-IN")}`,
            icon: Wallet,
            color: "#10B981",
            bgColor: "rgba(16, 185, 129, 0.15)",
        },
        {
            title: "Active Startups",
            value: stats?.startups || 0,
            icon: Building2,
            color: "#3B82F6",
            bgColor: "rgba(59, 130, 246, 0.15)",
        },
        {
            title: "Unread Messages",
            value: stats?.messages || 0,
            icon: MessageSquare,
            color: "#3B82F6",
            bgColor: "rgba(59, 130, 246, 0.15)",
        },
        {
            title: "Total Connections",
            value: stats?.connections || 0,
            icon: Users,
            color: "#F59E0B",
            bgColor: "rgba(245, 158, 11, 0.15)",
        },
    ];

    return (
        <div className="stats-grid">
            {statCards.map((item, index) => {
                const Icon = item.icon;

                return (
                    <motion.div
                        className="stat-card"
                        key={item.title}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ y: -6, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div
                            className="icon"
                            style={{
                                background: item.bgColor,
                                color: item.color,
                                border: `1px solid ${item.color}20`
                            }}
                        >
                            <Icon size={24} />
                        </div>

                        <div>
                            <h2 className="stat-number">
                                {item.value}
                            </h2>
                            <p className="stat-title">
                                {item.title}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}