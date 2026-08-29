import { ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// Renders an animated hero section for the admin dashboard highlighting core management capabilities securely.
const DashboardHero = () => {
  return (
    <motion.div
      className="admin-hero"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1>
          <ShieldCheck size={34} />
          Incubator Admin Panel
        </h1>

        <p>
          Manage startups, investors, platform activity, AI analytics,
          investments and system operations from one place.
        </p>
      </div>

      <div className="hero-badge">
        <Sparkles size={18} />
        Platform Online
      </div>
    </motion.div>
  );
};

export default DashboardHero;