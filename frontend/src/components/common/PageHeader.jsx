import { motion } from "framer-motion";

// Renders a consistent, animated page header section displaying titles, subtitles, and optional action buttons.
export default function PageHeader({
    title,
    subtitle,
    children,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .45 }}
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "35px",
                flexWrap: "wrap",
                gap: "20px",
            }}
        >
            <div>

                <h1
                    style={{
                        margin: 0,
                        fontSize: "36px",
                        fontWeight: "700",
                        color: "var(--text)",
                    }}
                >
                    {title}
                </h1>

                <p
                    style={{
                        color: "var(--text-light)",
                        marginTop: "10px",
                        fontSize: "17px",
                    }}
                >
                    {subtitle}
                </p>

            </div>

            {children}

        </motion.div>
    );
}