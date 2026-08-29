import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, FileText, IndianRupee, Save } from 'lucide-react';
import API from '../api';
import DashboardLayout from './layout/DashboardLayout';
import '../styles/profile.css';

// Renders a secure form interface enabling startups to author and update their investment pitch.
function CreatePitch() {
    const [formData, setFormData] = useState({ pitch_description: '', funding_goal: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Submits the newly authored pitch data securely to update the startup profile.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.patch('profile/', formData); // Update existing profile
            alert('🎉 Pitch saved successfully!');
            navigate('/startup-dashboard');
        } catch (err) {
            alert('Failed to save pitch.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="dashboard-content">
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="profile-card"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: 'var(--primary-glow)',
                            color: 'var(--primary)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Rocket size={22} />
                        </div>
                        <h2 className="profile-title" style={{ margin: 0 }}>Create / Update Your Pitch</h2>
                    </div>
                    <p className="profile-subtitle">Share your startup's mission and funding goals with active investors</p>

                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-group full">
                            <label className="input-label">
                                <FileText size={18} />
                                Pitch Description
                            </label>
                            <textarea 
                                placeholder="Describe your startup's mission, problem solved, and market opportunity..."
                                value={formData.pitch_description}
                                onChange={(e) => setFormData({...formData, pitch_description: e.target.value})}
                                rows={6}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label className="input-label">
                                <IndianRupee size={18} />
                                Funding Goal (INR)
                            </label>
                            <input 
                                type="number" 
                                placeholder="e.g. 5000000"
                                value={formData.funding_goal}
                                onChange={(e) => setFormData({...formData, funding_goal: e.target.value})}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="save-btn"
                            disabled={loading}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Save size={16} />
                            {loading ? 'Saving Pitch...' : 'Save Pitch'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}

export default CreatePitch;