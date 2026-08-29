import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, ChevronRight, BrainCircuit } from "lucide-react";
import API from "../../api";
import "../../styles/reports.css";

// Fetches and displays a summarized list of the startup's most recently generated AI analysis reports.
export default function RecentReports() {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await API.get("../reports/", {
                    params: { page: 1, page_size: 3 },
                });
                setReports(res.data.reports || []);
            } catch (err) {
                console.error("Failed to load recent reports:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecent();
    }, []);

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
        });
    };

    // Don't show widget if no reports
    if (!loading && reports.length === 0) return null;

    return (
        <motion.div
            className="dashboard-card recent-reports-widget"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{
                padding: "24px",
                background: "var(--surface-glass)",
                backdropFilter: "blur(16px)",
                border: "1px solid var(--border-glass)",
                borderRadius: "20px",
                boxShadow: "var(--shadow)",
            }}
        >
            <div className="recent-reports-header">
                <h3>
                    <BrainCircuit size={18} style={{ color: "var(--primary)" }} />
                    Recent AI Reports
                </h3>
                <button
                    className="recent-reports-view-all"
                    onClick={() => navigate("/my-reports")}
                >
                    View All →
                </button>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="report-skeleton" style={{ padding: "12px 16px" }}>
                            <div className="skeleton-icon skeleton-pulse" style={{ width: "8px", height: "8px", borderRadius: "50%" }} />
                            <div className="skeleton-info">
                                <div className="skeleton-title skeleton-pulse" style={{ height: "14px", width: "70%" }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {reports.map((report, index) => (
                        <motion.div
                            key={report.id}
                            className="recent-report-item"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.08 }}
                            onClick={() => navigate(`/report/${report.id}`)}
                        >
                            <div className="recent-report-dot" />
                            <span className="recent-report-name">
                                {report.report_title || report.startup_name}
                            </span>
                            <span className="recent-report-time">
                                {timeAgo(report.created_at)}
                            </span>
                            <ChevronRight size={16} className="recent-report-arrow" />
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
