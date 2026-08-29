import { motion } from "framer-motion";

// Renders an animated statistics card displaying key metrics with customizable icons and color themes.
const StatCard = ({
  title,
  value,
  icon: Icon,
  color = "#6366f1",
  subtitle,
}) => {
  return (
    <motion.div
      className="admin-stat-card"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
    >
      <div className="stat-top">
        <div
          className="stat-icon"
          style={{ background: color }}
        >
          {Icon && <Icon size={24} color="#fff" />}
        </div>

        <div className="stat-content">
          <h4>{title}</h4>
          <h2>{value}</h2>

          {subtitle && (
            <span className="stat-subtitle">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;