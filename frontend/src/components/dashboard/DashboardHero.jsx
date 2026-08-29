import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert } from "lucide-react";

// Displays a personalized, time-aware greeting banner highlighting the user's verification status and optional actions.
export default function DashboardHero({
    isVerified,
    title,
    subtitle,
    badge,
    actionElement // Added actionElement prop for the top-right CTA
}) {

    const hour = new Date().getHours();

    let greeting = "Good Evening";

    if (hour < 12) {
        greeting = "Good Morning";
    } else if (hour < 17) {
        greeting = "Good Afternoon";
    }

    return (

        <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-card"
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '20px'
            }}
        >
            <div style={{ flex: '1 1 min-content' }}>
                <div>
                    <h1 style={{ margin: '0 0 8px 0' }}>
                        {title || `${greeting} `}
                    </h1>

                    <p style={{ margin: '0 0 16px 0', color: 'var(--text-light)' }}>
                        {subtitle || "Welcome back. Ready to grow your startup today?"}
                    </p>
                </div>

                <div className="verify-box" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    {isVerified ? (
                        <>
                            <ShieldCheck size={22} />
                            {badge || "Verified"}
                        </>
                    ) : (
                        <>
                            <ShieldAlert size={22} />
                            Verification Pending
                        </>
                    )}
                </div>
            </div>

            {/* Render the CTA button on the right if provided */}
            {actionElement && (
                <div style={{ flexShrink: 0 }}>
                    {actionElement}
                </div>
            )}

        </motion.div>

    );
}