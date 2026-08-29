import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import API from '../api';
import '../styles/premium.css';
import PremiumSubscriptionModal from './PremiumSubscriptionModal';

// Manages premium subscription state, orchestrating Razorpay checkout flows and unlocking premium platform capabilities securely.
function UpgradeButton({ onPremiumActivated }) {
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await API.get('profile/');
                if (res.data) {
                    setProfileData(res.data);
                    if (res.data.is_premium) {
                        setIsPremium(true);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch premium status", err);
            } finally {
                setLoading(false);
            }
        };

        checkStatus();
    }, []);

    const handleUpgrade = async () => {
        if (isPremium || isProcessing) return;
        setIsProcessing(true);

        try {
            const response = await API.post('create-order/');
            const data = response.data;

            const options = {
                key: data.key,
                amount: data.amount,
                currency: "INR",
                name: "StartupAI",
                description: "Premium Membership",
                order_id: data.order_id,
                handler: async function (response) {
                    try {
                        await API.post("payment-success/", {
                            payment_id: response.razorpay_payment_id
                        });

                        setIsPremium(true);
                        // Refresh profile data to get updated expiry etc
                        const res = await API.get('profile/');
                        setProfileData(res.data);

                        if (onPremiumActivated) {
                            onPremiumActivated();
                        }
                    } catch (error) {
                        console.log(error);
                        alert("Premium activation failed.");
                    } finally {
                        setIsProcessing(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    }
                },
                theme: {
                    color: "#4F46E5"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.log(error);
            alert("Unable to start payment.");
            setIsProcessing(false);
        }
    };

    if (loading) {
        return null;
    }

    return (
        <>
            {isPremium ? (
                <motion.div
                    className="premium-cta-wrapper premium-member-badge-wrapper"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <button
                        className="premium-member-badge"
                        onClick={() => setIsModalOpen(true)}
                        style={{ border: 'none', width: '100%' }}
                    >
                        <div className="premium-shimmer" style={{ animationDuration: '4s' }} />
                        <div className="premium-badge-content">
                            <CheckCircle2 size={18} />
                            <span>Premium Member</span>
                        </div>
                        <span className="premium-badge-subtitle">Click to View Details</span>
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    className="premium-cta-wrapper"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <button
                        className="premium-cta-btn"
                        onClick={() => setIsModalOpen(true)}
                        disabled={isProcessing}
                    >
                        <div className="premium-shimmer" />

                        {isProcessing ? (
                            <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                        ) : (
                            <Crown size={20} color="#FBBF24" fill="#FBBF24" />
                        )}

                        <div className="premium-cta-content">
                            <span className="premium-cta-title">
                                Premium Member 
                                {!isProcessing && (
                                    <motion.div
                                        animate={{ rotate: [0, 15, -15, 0] }}
                                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    >
                                        <Sparkles size={14} color="#FDE68A" />
                                    </motion.div>
                                )}
                            </span>
                            <span className="premium-cta-subtitle">
                                Click to View Details
                            </span>
                        </div>
                    </button>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}} />
                </motion.div>
            )}

            <PremiumSubscriptionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                profile={profileData}
                onUpgrade={handleUpgrade}
                isProcessing={isProcessing}
            />
        </>
    );
}

export default UpgradeButton;