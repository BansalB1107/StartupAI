import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';
import Navbar from './Navbar';
import { Target, Shield, Clock, Brain } from "lucide-react";
import '../styles/funding-readiness.css';

// Renders a read-only public profile page displaying startup information, funding goals, and AI readiness scores.
function PublicStartupProfile() {
    const { startup_id } = useParams();
    const [startup, setStartup] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStartup = async () => {
            try {
                const res = await API.get(`startup-profile/${startup_id}/`);
                setStartup(res.data);
            } catch (err) {
                console.error("Error fetching startup profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStartup();
    }, [startup_id]);

    if (loading) return <div style={{ padding: '40px' }}>Loading startup details...</div>;
    if (!startup) return <div style={{ padding: '40px' }}>Startup not found.</div>;

    return (
        <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
            <Navbar />
            <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h1 style={{ margin: '0 0 10px 0' }}>
                        {startup.company_name} 
                        {startup.is_verified && <span style={{ marginLeft: '10px', fontSize: '20px' }}>✅</span>}
                    </h1>
                    <p style={{ color: '#666', fontSize: '18px' }}>Industry: {startup.industry}</p>
                    
                    <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />
                    
                    <h3>Pitch Description</h3>
                    <p style={{ lineHeight: '1.6' }}>{startup.pitch_description || "No pitch provided yet."}</p>
                    
                    <h3>Funding Goal</h3>
                    <p style={{ fontSize: '24px', color: '#28a745', fontWeight: 'bold' }}>
                        ${startup.funding_goal ? startup.funding_goal.toLocaleString() : "N/A"}
                    </p>

                    {/* AI Funding Readiness Read-Only Card */}
                    {startup.funding_readiness && (
                        <div className="funding-readonly-card">
                            <h3>
                                <SparklesIcon /> AI Funding Readiness
                            </h3>
                            
                            <div className="funding-score-row" style={{ marginBottom: "20px" }}>
                                <ScoreCircle score={startup.funding_readiness.score} />
                                
                                <div className="funding-info-grid">
                                    <div className="funding-info-item">
                                        <span className="info-label"><Shield size={14} style={{ marginRight: 6, verticalAlign: "middle" }}/> Status</span>
                                        <span className={`funding-badge ${getBadgeClass(startup.funding_readiness.label)}`}>
                                            {startup.funding_readiness.label}
                                        </span>
                                    </div>
                                    <div className="funding-info-item">
                                        <span className="info-label"><Target size={14} style={{ marginRight: 6, verticalAlign: "middle" }}/> Confidence</span>
                                        <span className={`info-value ${getConfidenceClass(startup.funding_readiness.confidence)}`}>
                                            {startup.funding_readiness.confidence}
                                        </span>
                                    </div>
                                    <div className="funding-info-item">
                                        <span className="info-label"><Clock size={14} style={{ marginRight: 6, verticalAlign: "middle" }}/> Last Updated</span>
                                        <span className="info-value">{startup.funding_readiness.last_updated}</span>
                                    </div>
                                </div>
                            </div>

                            {startup.funding_readiness.ai_summary && (
                                <div className="funding-explanation">
                                    <h4><Brain size={16} /> AI Analysis</h4>
                                    <p>{startup.funding_readiness.ai_summary}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helpers for the read-only card
// Returns a stylized SVG sparkles icon used visually within the AI funding readiness section.
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#a855f7" }}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
);

// Determines and returns a semantic hex color code based on the provided numeric AI readiness score.
function getScoreColor(score) {
    if (score >= 90) return "#059669";
    if (score >= 75) return "#2563eb";
    if (score >= 60) return "#d97706";
    if (score >= 40) return "#ea580c";
    return "#dc2626";
}

// Maps AI readiness status labels to specific CSS classes for consistent visual styling across components.
function getBadgeClass(label) {
    const map = {
        Outstanding: "badge-outstanding",
        High: "badge-high",
        Moderate: "badge-moderate",
        Low: "badge-low",
        "Very Low": "badge-very-low",
    };
    return map[label] || "badge-moderate";
}

// Returns appropriate CSS classes based on the AI confidence level strings to apply matching color themes.
function getConfidenceClass(conf) {
    if (conf === "High") return "confidence-high";
    if (conf === "Medium") return "confidence-medium";
    return "confidence-low";
}

// Renders an animated SVG circular progress indicator displaying the startup's AI-generated funding readiness score.
function ScoreCircle({ score }) {
    const radius = 55;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = getScoreColor(score);

    return (
        <div className="score-circle-wrapper" style={{ width: 140, height: 140 }}>
            <svg className="score-circle-svg" viewBox="0 0 140 140" style={{ width: 140, height: 140 }}>
                <circle className="score-circle-bg" cx="70" cy="70" r={radius} strokeWidth="8"/>
                <circle
                    className="score-circle-fill"
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke={color}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="score-circle-text">
                <span className="score-value" style={{ color, fontSize: 32 }}>
                    {Math.round(score)}
                </span>
                <span className="score-unit" style={{ fontSize: 16 }}>%</span>
                <div className="score-subtitle" style={{ fontSize: 10 }}>Score</div>
            </div>
        </div>
    );
}

export default PublicStartupProfile;