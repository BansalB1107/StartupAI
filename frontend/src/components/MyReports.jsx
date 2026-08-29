import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Search,
    Star,
    Trash2,
    Pencil,
    Crown,
    Clock,
    BrainCircuit,
    X,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Download,
    Mail,
    Loader2,
} from "lucide-react";
import API from "../api";
import DashboardLayout from "./layout/DashboardLayout";
import Toast from "./Toast";
import "../styles/reports.css";

// Renders an interactive management interface for founders to view, rename, download, and email generated AI strategy reports.
function MyReports() {
    const navigate = useNavigate();

    // State
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Rename modal
    const [renameTarget, setRenameTarget] = useState(null);
    const [renameValue, setRenameValue] = useState("");

    // Export states
    const [downloadingId, setDownloadingId] = useState(null);
    const [emailingId, setEmailingId] = useState(null);
    const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

    // ── Fetch Reports ──

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, page_size: 10 };
            if (search.trim()) params.search = search.trim();

            const res = await API.get("../reports/", { params });
            setReports(res.data.reports || []);
            setTotalPages(res.data.total_pages || 1);
            setTotalCount(res.data.total || 0);
        } catch (err) {
            console.error("Failed to fetch reports:", err);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // Reset page when searching
    useEffect(() => {
        setPage(1);
    }, [search]);

    // ── Actions ──

    const handleFavorite = async (e, reportId) => {
        e.stopPropagation();
        try {
            const res = await API.patch(`../reports/${reportId}/favorite/`);
            setReports((prev) =>
                prev.map((r) =>
                    r.id === reportId ? { ...r, favorite: res.data.favorite } : r
                )
            );
        } catch (err) {
            console.error("Toggle favorite failed:", err);
        }
    };

    const handleDelete = async (e, reportId) => {
        e.stopPropagation();
        if (!window.confirm("Delete this report? It will be hidden from your history.")) return;

        try {
            await API.delete(`../reports/${reportId}/delete/`);
            setReports((prev) => prev.filter((r) => r.id !== reportId));
            setTotalCount((c) => c - 1);
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const openRename = (e, report) => {
        e.stopPropagation();
        setRenameTarget(report);
        setRenameValue(report.report_title);
    };

    const handleRename = async () => {
        if (!renameValue.trim() || !renameTarget) return;

        try {
            const res = await API.patch(`../reports/${renameTarget.id}/rename/`, {
                title: renameValue.trim(),
            });
            setReports((prev) =>
                prev.map((r) =>
                    r.id === renameTarget.id
                        ? { ...r, report_title: res.data.report_title }
                        : r
                )
            );
            setRenameTarget(null);
        } catch (err) {
            console.error("Rename failed:", err);
        }
    };

    // ── Download PDF ──
    const handleDownload = async (e, reportId) => {
        e.stopPropagation();
        if (downloadingId) return;
        setDownloadingId(reportId);

        try {
            const response = await API.get(`../reports/${reportId}/download/`, {
                responseType: "blob",
            });

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            const disposition = response.headers["content-disposition"];
            let filename = "Report.pdf";
            if (disposition) {
                const match = disposition.match(/filename="?(.+?)"?$/);
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
            setToast({ visible: true, message: "Failed to download PDF", type: "error" });
        } finally {
            setDownloadingId(null);
        }
    };

    // ── Email Report ──
    const handleEmail = async (e, reportId) => {
        e.stopPropagation();
        if (emailingId) return;
        setEmailingId(reportId);

        try {
            const res = await API.post(`../reports/${reportId}/email/`);
            setToast({
                visible: true,
                message: `Report emailed to ${res.data.email} ✓`,
                type: "success",
            });
        } catch (err) {
            console.error("Email failed:", err);
            setToast({ visible: true, message: "Failed to send email", type: "error" });
        } finally {
            setEmailingId(null);
        }
    };

    // ── Time ago helper ──

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

    // ── Render ──

    return (
        <DashboardLayout>
            <div className="dashboard-content">
                {/* Header */}
                <div className="reports-header">
                    <div className="reports-title-row">
                        <div className="reports-title-group">
                            <div className="reports-icon-wrapper">
                                <FileText size={26} color="#fff" />
                            </div>
                            <div>
                                <h1 className="reports-title">My Reports</h1>
                                <p className="reports-subtitle">
                                    Your AI-generated startup analysis history
                                </p>
                            </div>
                        </div>
                        {totalCount > 0 && (
                            <span className="reports-count-badge">
                                {totalCount} Report{totalCount !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>

                    {/* Search */}
                    <div className="reports-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by startup name, industry, or keywords..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                className="search-clear-btn"
                                onClick={() => setSearch("")}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    /* Loading Skeletons */
                    <div className="reports-grid">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="report-skeleton">
                                <div className="skeleton-icon skeleton-pulse" />
                                <div className="skeleton-info">
                                    <div className="skeleton-title skeleton-pulse" />
                                    <div className="skeleton-meta skeleton-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : reports.length === 0 ? (
                    /* Empty State */
                    <motion.div
                        className="reports-empty glass-panel"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="reports-empty-icon">
                            <BrainCircuit size={36} />
                        </div>
                        <h3>{search ? "No reports found" : "No reports yet"}</h3>
                        <p>
                            {search
                                ? `No reports matching "${search}". Try a different search.`
                                : "Generate your first AI startup analysis to see it here."}
                        </p>
                        {!search && (
                            <button
                                className="reports-empty-btn"
                                onClick={() => navigate("/strategy")}
                            >
                                <Sparkles size={16} style={{ marginRight: 6 }} />
                                Generate First Report
                            </button>
                        )}
                    </motion.div>
                ) : (
                    /* Report Cards */
                    <>
                        <div className="reports-grid">
                            <AnimatePresence>
                                {reports.map((report, index) => (
                                    <motion.div
                                        key={report.id}
                                        className="report-card"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.25, delay: index * 0.03 }}
                                        onClick={() => navigate(`/report/${report.id}`)}
                                    >
                                        <div className="report-card-icon">
                                            <FileText size={22} />
                                        </div>

                                        <div className="report-card-info">
                                            <h4 className="report-card-title">
                                                {report.report_title}
                                            </h4>
                                            <div className="report-card-meta">
                                                <span className="report-card-industry">
                                                    {report.industry}
                                                </span>
                                                <span className="report-card-date">
                                                    <Clock size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                                                    {timeAgo(report.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="report-card-badges">
                                            {report.premium && (
                                                <span className="premium-badge">
                                                    <Crown size={12} /> Premium
                                                </span>
                                            )}
                                        </div>

                                        <div className="report-card-actions">
                                            <button
                                                className="report-action-btn download-btn"
                                                onClick={(e) => handleDownload(e, report.id)}
                                                disabled={downloadingId === report.id}
                                                title="Download PDF"
                                            >
                                                {downloadingId === report.id ? (
                                                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                                                ) : (
                                                    <Download size={16} />
                                                )}
                                            </button>
                                            <button
                                                className="report-action-btn email-btn"
                                                onClick={(e) => handleEmail(e, report.id)}
                                                disabled={emailingId === report.id}
                                                title="Email Report"
                                            >
                                                {emailingId === report.id ? (
                                                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                                                ) : (
                                                    <Mail size={16} />
                                                )}
                                            </button>
                                            <button
                                                className={`report-action-btn ${report.favorite ? "favorite-active" : ""}`}
                                                onClick={(e) => handleFavorite(e, report.id)}
                                                title={report.favorite ? "Unfavorite" : "Favorite"}
                                            >
                                                <Star
                                                    size={16}
                                                    fill={report.favorite ? "#eab308" : "none"}
                                                />
                                            </button>
                                            <button
                                                className="report-action-btn"
                                                onClick={(e) => openRename(e, report)}
                                                title="Rename"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                className="report-action-btn report-delete-btn"
                                                onClick={(e) => handleDelete(e, report.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="reports-pagination">
                                <button
                                    className="pagination-btn"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="pagination-info">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    className="pagination-btn"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Rename Modal */}
                <AnimatePresence>
                    {renameTarget && (
                        <motion.div
                            className="rename-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setRenameTarget(null)}
                        >
                            <motion.div
                                className="rename-modal"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3>✏️ Rename Report</h3>
                                <input
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    placeholder="Enter new report name..."
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleRename();
                                        if (e.key === "Escape") setRenameTarget(null);
                                    }}
                                />
                                <div className="rename-actions">
                                    <button
                                        className="rename-cancel-btn"
                                        onClick={() => setRenameTarget(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="rename-save-btn"
                                        onClick={handleRename}
                                    >
                                        Save
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Toast */}
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.visible}
                    onClose={() => setToast({ ...toast, visible: false })}
                />
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}} />
        </DashboardLayout>
    );
}

export default MyReports;
