import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    FileText,
    Crown,
    Star,
    Clock,
    Loader2,
    Download,
    Mail,
} from "lucide-react";
import API from "../api";
import DashboardLayout from "./layout/DashboardLayout";
import ReportRenderer from "./ReportRenderer";
import PDFLoadingModal from "./PDFLoadingModal";
import Toast from "./Toast";
import "../styles/reports.css";

/**
 * ReportDetail — Opens a saved report from MongoDB.
 * Does NOT call Gemini. Loads report_json from history.
 * Now includes Download PDF and Email Report buttons.
 */
// Retrieves and renders a saved AI strategy report from history, supporting PDF downloads and email exports.
function ReportDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPremium, setIsPremium] = useState(false);

    // Export states
    const [pdfLoading, setPdfLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                // Fetch user premium status
                const profileRes = await API.get("profile/");
                setIsPremium(profileRes.data.is_premium || false);

                // Fetch saved report
                const res = await API.get(`../reports/${id}/`);
                setReport(res.data);
            } catch (err) {
                console.error("Failed to load report:", err);
                setError(
                    err.response?.status === 404
                        ? "Report not found"
                        : "Failed to load report"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id]);

    // ── Download PDF ──
    const handleDownload = useCallback(async () => {
        if (pdfLoading) return;
        setPdfLoading(true);

        try {
            const response = await API.get(`../reports/${id}/download/`, {
                responseType: "blob",
            });

            // Create download link
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            // Extract filename from Content-Disposition header or build one
            const disposition = response.headers["content-disposition"];
            let filename = "Report.pdf";
            if (disposition) {
                const match = disposition.match(/filename="?(.+)"?/);
                if (match) filename = match[1];
            }

            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setToast({ visible: true, message: "PDF downloaded successfully ✓", type: "success" });
        } catch (err) {
            console.error("Download failed:", err);
            setToast({ visible: true, message: "Failed to download PDF. Please try again.", type: "error" });
        } finally {
            setPdfLoading(false);
        }
    }, [id, pdfLoading]);

    // ── Email Report ──
    const handleEmail = useCallback(async () => {
        if (emailLoading) return;
        setEmailLoading(true);

        try {
            const res = await API.post(`../reports/${id}/email/`);
            setToast({
                visible: true,
                message: `Report emailed to ${res.data.email} ✓`,
                type: "success",
            });
        } catch (err) {
            console.error("Email failed:", err);
            setToast({ visible: true, message: "Failed to send email. Please try again.", type: "error" });
        } finally {
            setEmailLoading(false);
        }
    }, [id, emailLoading]);

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
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="dashboard-content">
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "80px 40px",
                        gap: "16px",
                    }}>
                        <Loader2
                            size={36}
                            style={{
                                color: "var(--primary)",
                                animation: "spin 1s linear infinite",
                            }}
                        />
                        <p style={{
                            fontSize: "14px",
                            color: "var(--text-light)",
                            fontWeight: "600",
                        }}>
                            Loading report...
                        </p>
                    </div>
                    <style dangerouslySetInnerHTML={{ __html: `
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}} />
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="dashboard-content">
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "80px 40px",
                        gap: "16px",
                    }}>
                        <FileText size={48} style={{ color: "var(--text-lighter)" }} />
                        <h3 style={{ margin: 0 }}>{error}</h3>
                        <button
                            className="reports-empty-btn"
                            onClick={() => navigate("/my-reports")}
                        >
                            Back to My Reports
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="dashboard-content">
                {/* Header */}
                <motion.div
                    className="report-detail-header"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <button
                        className="report-detail-back"
                        onClick={() => navigate("/my-reports")}
                        title="Back to My Reports"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="report-detail-info">
                        <h1 className="report-detail-title">
                            {report.report_title}
                        </h1>
                        <div className="report-detail-meta">
                            <span style={{ marginRight: "16px" }}>
                                {report.industry}
                            </span>
                            <span>
                                <Clock size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                                {timeAgo(report.created_at)}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        {report.premium && (
                            <span className="premium-badge">
                                <Crown size={12} /> Premium
                            </span>
                        )}
                        {report.favorite && (
                            <Star size={18} fill="#eab308" color="#eab308" />
                        )}

                        {/* ── Export Buttons ── */}
                        <div className="report-export-row">
                            <button
                                className="report-export-btn download-btn"
                                onClick={handleDownload}
                                disabled={pdfLoading}
                                title="Download PDF"
                            >
                                {pdfLoading ? (
                                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                                ) : (
                                    <Download size={16} />
                                )}
                                <span>{pdfLoading ? "Preparing..." : "Download PDF"}</span>
                            </button>

                            <button
                                className="report-export-btn email-btn"
                                onClick={handleEmail}
                                disabled={emailLoading}
                                title="Email Report"
                            >
                                {emailLoading ? (
                                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                                ) : (
                                    <Mail size={16} />
                                )}
                                <span>{emailLoading ? "Sending..." : "Email Report"}</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Report Content — rendered exactly like the live strategy page */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <ReportRenderer
                        report={report.report_json?.report || report.report_json}
                        isPremium={isPremium}
                    />
                </motion.div>
            </div>

            {/* Loading Modal */}
            <PDFLoadingModal isOpen={pdfLoading} />

            {/* Toast */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onClose={() => setToast({ ...toast, visible: false })}
            />

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}} />
        </DashboardLayout>
    );
}

export default ReportDetail;
