import { motion } from "framer-motion";

// Provides a reusable animated card container wrapper adding subtle hover effects and standardized shadows.
export default function Card({
    children,
    className = "",
}) {
    return (

        <motion.div

            whileHover={{
                y: -4,
            }}

            transition={{
                duration: .2,
            }}

            className={`app-card ${className}`}

        >

            {children}

        </motion.div>

    );
}