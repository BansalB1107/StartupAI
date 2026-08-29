import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

// Renders a public profile page displaying detailed information and focus areas for a specific investor.
function InvestorProfile() {
    const { investor_id } = useParams(); // ID from the URL
    const [investor, setInvestor] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInvestor = async () => {
            try {
                // Pointing to the backend view we discussed
                const res = await API.get(`investor-profile/${investor_id}/`);
                setInvestor(res.data);
            } catch (err) {
                console.error("Error fetching investor profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvestor();
    }, [investor_id]);

    if (loading) return <div style={{ padding: '40px' }}>Loading investor details...</div>;
    if (!investor) return <div style={{ padding: '40px' }}>Investor not found.</div>;

    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
            <Navbar />
            <button 
                onClick={() => navigate(-1)} 
                style={styles.backButton}
            >
                ← Back to List
            </button>
            <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2>Investor Profile</h2>
                    <hr />
                    <p><strong>Name:</strong> {investor.name}</p>
                    <p><strong>Bio:</strong> {investor.bio || "No bio provided."}</p>
                    <p><strong>Focus Industry:</strong> {investor.industry_interest || "N/A"}</p>
                    <p><strong>Status:</strong> {investor.is_verified ? "✅ Verified Investor" : "⏳ Unverified"}</p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    backButton: { margin: '20px 40px', padding: '8px 12px', borderRadius: '6px', border: 'none', background: '#eef2ff', color: '#1f2937', cursor: 'pointer' }
};

export default InvestorProfile;