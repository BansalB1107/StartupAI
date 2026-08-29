import React, { useState, useEffect } from 'react';
import API from '../api';

// Manages user wallet balances, processing deposits, withdrawals, and tracking platform referral reward transactions securely.
function WalletManager() {
    const [balance, setBalance] = useState(0.0);
    const [referralCode, setReferralCode] = useState('');
    const [inputAmount, setInputAmount] = useState('');
    const [inputReferral, setInputReferral] = useState('');

    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch initial wallet stats on load
    useEffect(() => {
        const fetchWalletDetails = async () => {
            try {
                const response = await API.get('wallet/');
                setBalance(response.data.balance);
                setReferralCode(response.data.referral_code);
            } catch (err) {
                console.error("Failed to load wallet balance data", err);
            }
        };
        fetchWalletDetails();
    }, []);

    const handleTransaction = async (action) => {
        setSuccessMsg('');
        setErrorMsg('');

        if ((action === 'deposit' || action === 'withdraw') && (!inputAmount || Number(inputAmount) <= 0)) {
            setErrorMsg('Please enter a valid monetary amount greater than zero.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                action: action,
                amount: action !== 'referral' ? Number(inputAmount) : 0,
                referral_code: action === 'referral' ? inputReferral : ''
            };

            const response = await API.post('wallet/', payload);
            setBalance(response.data.balance);
            setSuccessMsg(response.data.message);
            setInputAmount('');
            if (action === 'referral') setInputReferral('');
        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Transaction could not be completed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.walletCard}>
            <div style={styles.header}>
                <h3 style={{ margin: 0, color: '#1e293b' }}>🪙 Secure Investment Wallet</h3>
                <span style={styles.walletBadge}>Active</span>
            </div>

            {/* Live Balance Tracker */}
            <div style={styles.balanceContainer}>
                <span style={styles.balanceLabel}>AVAILABLE WALLET BALANCE</span>
                <h1 style={styles.balanceValue}>₹{Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h1>
                <p style={styles.referralHint}>Your Shareable Referral Code: <strong style={{ color: '#2563eb' }}>{referralCode || 'GENERATING...'}</strong></p>
            </div>

            {successMsg && <div style={styles.successBox}>✅ {successMsg}</div>}
            {errorMsg && <div style={styles.errorBox}>❌ {errorMsg}</div>}

            {/* Interactive Forms Section */}
            <div style={styles.formGrid}>
                {/* Deposit & Withdraw column */}
                <div style={styles.actionColumn}>
                    <label style={styles.label}>Transact Funds (₹)</label>
                    <input
                        type="number"
                        placeholder="Enter amount in Rupees"
                        value={inputAmount}
                        onChange={(e) => setInputAmount(e.target.value)}
                        style={styles.input}
                    />
                    <div style={styles.buttonRow}>
                        <button
                            disabled={loading}
                            onClick={() => handleTransaction('deposit')}
                            style={styles.depositBtn}
                        >
                            Deposit
                        </button>
                        <button
                            disabled={loading}
                            onClick={() => handleTransaction('withdraw')}
                            style={styles.withdrawBtn}
                        >
                            Withdraw
                        </button>
                    </div>
                </div>

                {/* Referral Column */}
                <div style={styles.actionColumn}>
                    <label style={styles.label}>Claim Referral Bonus (₹500)</label>
                    <input
                        type="text"
                        placeholder="Enter partner referral code"
                        value={inputReferral}
                        onChange={(e) => setInputReferral(e.target.value)}
                        style={styles.input}
                    />
                    <button
                        disabled={loading}
                        onClick={() => handleTransaction('referral')}
                        style={styles.referralBtn}
                    >
                        Claim Bonus
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    walletCard: {
        background: "transparent",
        width: "100%",
        maxWidth: "100%",
        padding: 0,
        margin: 0,
        borderRadius: 0,
        boxShadow: "none",
        boxSizing: "border-box",
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    walletBadge: { backgroundColor: '#def7ec', color: '#03543f', fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '20px' },
    balanceContainer: { background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' },
    balanceLabel: { fontSize: '11px', color: '#64748b', fontWeight: 'bold', letterSpacing: '0.05em' },
    balanceValue: { fontSize: '32px', margin: '5px 0', color: '#0f172a', fontWeight: '800' },
    referralHint: { fontSize: '13px', color: '#475569', margin: '5px 0 0 0' },
    formGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px",
        borderTop: "1px solid var(--border)",
        paddingTop: "20px",
        width: "100%",
    },
    actionColumn: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#475569' },
    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        fontSize: "14px",
        outline: "none",
    },
    buttonRow: {
        display: "flex",
        gap: "10px",
        width: "100%",
    },
    depositBtn: {
        flex: 1,
        width: "100%",
        padding: "10px",
        background: "#10b981",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: "pointer",
    },
    withdrawBtn: {
        flex: 1,
        width: "100%",
        padding: "10px",
        background: "#ef4444",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: "pointer",
    },
    referralBtn: {
        width: "100%",
        padding: "10px",
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: "pointer",
    },
    successBox: { backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px' },
    errorBox: { backgroundColor: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '15px' }
};

export default WalletManager;
