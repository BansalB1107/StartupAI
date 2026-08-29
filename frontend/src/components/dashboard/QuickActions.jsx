import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Rocket,
  BarChart3,
  BrainCircuit,
  MessageSquare,
} from "lucide-react";

const actions = [
  {
    title: "Create Pitch",
    subtitle: "Share your startup idea",
    icon: Rocket,
    path: "/create-pitch",
  },
  {
    title: "Analytics",
    subtitle: "View startup insights",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    title: "AI Strategy",
    subtitle: "AI recommendations",
    icon: BrainCircuit,
    path: "/strategy",
  },
  {
    title: "Messages",
    subtitle: "Talk with investors",
    icon: MessageSquare,
    path: "/messages",
  },
];

// Renders an animated grid of fast access buttons for crucial startup dashboard tasks and insights.
export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="quick-grid">
      {actions.map((item) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.title}
            whileHover={{
              y: -8,
              scale: 1.03,
            }}
            whileTap={{ scale: 0.98 }}
            className="quick-card"
            onClick={() => navigate(item.path)}
          >
            <div
              className="quick-icon"
              style={{
                background: "rgba(59, 130, 246, 0.15)",
              }}
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