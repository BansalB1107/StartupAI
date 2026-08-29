import { motion } from "framer-motion";

// Displays key statistical metrics in an animated, stylized card format with customizable semantic themes.
export default function StatCard({
    icon,
    title,
    value,
    color = "var(--primary)",
    onClick,
}) {
    // Determine if this is a semantic color (success/warning) or default to primary blue
    const getIconBg = () => {
        if (color === "#10B981" || color === "#10b981" || color === "var(--success)") {
            return "rgba(16, 185, 129, 0.15)";
        }
        if (color === "#F59E0B" || color === "#f59e0b" || color === "var(--warning)") {
            return "rgba(245, 158, 11, 0.15)";
        }
        if (color === "#EF4444" || color === "#ef4444" || color === "var(--error)") {
            return "rgba(239, 68, 68, 0.15)";
        }
        // Default: primary blue
        return "rgba(59, 130, 246, 0.15)";
    };

    const getIconColor = () => {
        if (color === "#10B981" || color === "#10b981" || color === "var(--success)") return "#10B981";
        if (color === "#F59E0B" || color === "#f59e0b" || color === "var(--warning)") return "#F59E0B";
        if (color === "#EF4444" || color === "#ef4444" || color === "var(--error)") return "#EF4444";
        return "#3B82F6";
    };

    return (
        <motion.div
            whileHover={{
                y: -6,
                scale: 1.02,
            }}
            whileTap={{
                scale: 0.98,
            }}
            transition={{
                duration: 0.2,
            }}
            onClick={onClick}
            style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "24px",
                display: "flex",
                alignItems: "center",
                gap: "18px",
                cursor: onClick ? "pointer" : "default",
                boxShadow: "var(--shadow)",
                transition: "all 0.25s ease",
            }}
        >
            <div
                style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "16px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: getIconBg(),
                    color: getIconColor(),
                }}
            >
                {icon}
            </div>

            <div>
                <h2
                    style={{
                        margin: 0,
                        color: "var(--text)",
                        fontSize: "28px",
                    }}
                >
                    {value}
                </h2>

                <p
                    style={{
                        marginTop: "8px",
                        color: "var(--text-light)",
                    }}
                >
                    {title}
                </p>
            </div>
        </motion.div>
    );
}