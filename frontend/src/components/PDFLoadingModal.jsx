import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, FileText, BarChart3, Sparkles, CheckCircle2 } from "lucide-react";

/**
 * PDFLoadingModal — Elegant loading overlay shown during PDF generation/download.
 *
 * Props:
 *   isOpen   — boolean, controls visibility
 *   onClose  — optional callback when animation completes
 */

const STEPS = [
    { icon: FileText, text: "Preparing your report...", color: "#6366F1" },
    { icon: BarChart3, text: "Building charts & tables...", color: "#818CF8" },
    { icon: Sparkles, text: "Formatting pages...", color: "#A855F7" },
    { icon: CheckCircle2, text: "Almost ready...", color: "#10B981" },
];

// Displays an elegant, multi-step animated overlay modal indicating the progression of PDF report generation.
export default function PDFLoadingModal({ isOpen, onClose }) {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(0);
            return;
        }

        const interval = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev < STEPS.length - 1) return prev + 1;
                return prev;
            });
        }, 800);

        return () => clearInterval(interval);
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="pdf-loading-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                >
                    <motion.div
                        className="pdf-loading-modal"
                        initial={{ scale: 0.85, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.85, opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {/* Spinning loader */}
                        <motion.div
                            className="pdf-loading-spinner"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        >
                            <Loader2 size={36} />
                        </motion.div>

                        {/* Steps */}
                        <div className="pdf-loading-steps">
                            {STEPS.map((step, index) => {
                                const StepIcon = step.icon;
                                const isActive = index === currentStep;
                                const isDone = index < currentStep;

                                return (
                                    <motion.div
                                        key={index}
                                        className={`pdf-loading-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{
                                            opacity: isDone || isActive ? 1 : 0.35,
                                            x: 0,
                                        }}
                                        transition={{ delay: index * 0.15, duration: 0.3 }}
                                    >
                                        <div
                                            className="pdf-step-icon"
                                            style={{
                                                color: isActive || isDone ? step.color : "var(--text-lighter)",
                                                background: isActive
                                                    ? `${step.color}18`
                                                    : isDone
                                                    ? "var(--success-glow)"
                                                    : "transparent",
                                            }}
                                        >
                                            {isDone ? (
                                                <CheckCircle2 size={16} />
                                            ) : (
                                                <StepIcon size={16} />
                                            )}
                                        </div>
                                        <span
                                            className="pdf-step-text"
                                            style={{
                                                color: isActive ? "var(--text)" : isDone ? "var(--success)" : "var(--text-lighter)",
                                                fontWeight: isActive ? 700 : 500,
                                            }}
                                        >
                                            {step.text}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Progress bar */}
                        <div className="pdf-loading-progress">
                            <motion.div
                                className="pdf-loading-progress-bar"
                                initial={{ width: "0%" }}
                                animate={{
                                    width: `${((currentStep + 1) / STEPS.length) * 100}%`,
                                }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
