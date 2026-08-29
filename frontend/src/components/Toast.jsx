import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, X } from "lucide-react";

// Displays temporary, animated contextual notification banners indicating operation success, failure, or general feedback.
export default function Toast({ message, type = "success", isVisible, onClose, duration = 3000 }) {
    useEffect(() => {
        if (!isVisible) return;

        const timer = setTimeout(() => {
            if (onClose) onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [isVisible, duration, onClose]);

    const isSuccess = type === "success";

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="toast-notification"
                    style={{
                        borderColor: isSuccess
                            ? "rgba(16, 185, 129, 0.3)"
                            : "rgba(239, 68, 68, 0.3)",
                        background: isSuccess
                            ? "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02))"
                            : "linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.02))",
                    }}
                    initial={{ opacity: 0, y: -30, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, x: 20, scale: 0.9 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                >
                    <div className="toast-icon" style={{
                        color: isSuccess ? "var(--success)" : "var(--error)",
                    }}>
                        {isSuccess ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    </div>

                    <span className="toast-message">{message}</span>

                    <button className="toast-close" onClick={onClose}>
                        <X size={14} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
