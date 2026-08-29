import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, CheckCircle2, X } from 'lucide-react';
import '../styles/premium.css';

// Renders an overlay modal detailing premium subscription benefits, active plan status, and secure payment upgrade options.
function PremiumSubscriptionModal({ isOpen, onClose, profile, onUpgrade, isProcessing }) {
    if (!isOpen) return null;

    const isPremium = profile?.is_premium;

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Calculate Purchase Date by subtracting 30 days from expiry (as it's a 30-day plan)
    const getPurchaseDate = (expiryString) => {
        if (!expiryString) return "N/A";
        const expiry = new Date(expiryString);
        const purchase = new Date(expiry.getTime() - (30 * 24 * 60 * 60 * 1000));
        return formatDate(purchase);
    };

    const remainingDays = profile?.remaining_days || 0;

    // Progress bar color logic
    let progressColor = "#ef4444"; // Red for <=3 days
    if (remainingDays > 15) progressColor = "#10b981"; // Green
    else if (remainingDays >= 7) progressColor = "#f59e0b"; // Yellow

    const progressPercentage = Math.min(100, Math.max(0, (remainingDays / 30) * 100));

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                <motion.div
                    className="modal-content"
                    initial={{ y: 50, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: '#fff', borderRadius: '16px', padding: '30px',
                        width: '90%', maxWidth: '400px', position: 'relative',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '15px', right: '15px', background: 'none',
                            border: 'none', cursor: 'pointer', color: '#6b7280'
                        }}
                    >
                        <X size={24} />
                    </button>

                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <Crown size={48} color="#FBBF24" fill="#FBBF24" style={{ marginBottom: '10px' }} />
                        <h2 style={{ margin: 0, color: '#1f2937', fontSize: '24px', fontWeight: 'bold' }}>StartupAI Pro</h2>
                    </div>

                    {isPremium ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                                <span style={{ color: '#6b7280', fontWeight: 500 }}>Status:</span>
                                <span style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <CheckCircle2 size={16} /> ACTIVE
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                                <span style={{ color: '#6b7280', fontWeight: 500 }}>Plan:</span>
                                <span style={{ color: '#1f2937', fontWeight: 500 }}>Monthly</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                                <span style={{ color: '#6b7280', fontWeight: 500 }}>Price:</span>
                                <span style={{ color: '#1f2937', fontWeight: 500 }}>₹299</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                                <span style={{ color: '#6b7280', fontWeight: 500 }}>Purchase Date:</span>
                                <span style={{ color: '#1f2937', fontWeight: 500 }}>{getPurchaseDate(profile.subscription_expiry)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                                <span style={{ color: '#6b7280', fontWeight: 500 }}>Next Billing Date:</span>
                                <span style={{ color: '#1f2937', fontWeight: 500 }}>{formatDate(profile.subscription_expiry)}</span>
                            </div>
                            <div style={{ marginTop: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: '#6b7280', fontWeight: 500, fontSize: '14px' }}>Days Remaining:</span>
                                    <span style={{ color: progressColor, fontWeight: 'bold', fontSize: '14px' }}>{remainingDays} Days</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        style={{ height: '100%', backgroundColor: progressColor, borderRadius: '4px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: '#4b5563', marginBottom: '20px', fontSize: '15px' }}>
                                Unlock Premium Features:
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 25px 0', textAlign: 'left', display: 'inline-block' }}>
                                {['Unlimited Reports', 'Advanced Analytics', 'Priority Access', 'Premium Badge'].map((feature, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#1f2937' }}>
                                        <CheckCircle2 size={18} color="#4F46E5" /> {feature}
                                    </li>
                                ))}
                            </ul>

                            <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '5px' }}>Price</div>
                                <div style={{ color: '#1f2937', fontSize: '24px', fontWeight: 'bold' }}>₹299 <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280' }}>/ 30 Days</span></div>
                            </div>

                            <button
                                onClick={onUpgrade}
                                disabled={isProcessing}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
                                    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                                    color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)',
                                    opacity: isProcessing ? 0.7 : 1
                                }}
                            >
                                {isProcessing ? "Processing..." : "Upgrade to Premium"}
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default PremiumSubscriptionModal;
