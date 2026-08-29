import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Search,
    Briefcase,
    MessageSquare,
} from "lucide-react";

const actions = [
    {
        title: "Browse Startups",
        subtitle: "Explore investment opportunities",
        icon: Search,
        path: "/marketplace",
    },
    {
        title: "Portfolio",
        subtitle: "Track your investments",
        icon: Briefcase,
        path: "/portfolio",
    },
    {
        title: "Messages",
        subtitle: "Chat with founders",
        icon: MessageSquare,
        path: "/messages",
    },
];

// Renders a stylized grid of quick navigation shortcuts for essential investor platform functionalities.
export default function InvestorQuickActions() {
    const navigate = useNavigate();

    return (
        <div className="quick-grid">
            {actions.map((item) => {
                const Icon = item.icon;

                return (
                    <motion.div
                        key={item.title}
                        whileHover={{ y: -8, scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="quick-card"
                        onClick={() => navigate(item.path)}
                    >
                        <div
                            className="quick-icon"
                            style={{ background: "rgba(59, 130, 246, 0.15)" }}
                        >
                            <Icon size={28} color="#3B82F6" />
                        </div>

                        <h3>{item.title}</h3>
                        <p>{item.subtitle}</p>
                    </motion.div>
                );
            })}
        </div>
    );
}