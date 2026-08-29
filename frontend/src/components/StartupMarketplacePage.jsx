import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Rocket,
    BadgeCheck,
    X,
} from "lucide-react";
import API from "../api";
import session from '../session';
import DashboardLayout from "./layout/DashboardLayout";
import DashboardHero from "./dashboard/DashboardHero";
import "../styles/investor.css";
import "../styles/marketplace.css";

const ITEMS_PER_PAGE = 12;

const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "funding_high", label: "Funding: High → Low" },
    { value: "funding_low", label: "Funding: Low → High" },
    { value: "name_asc", label: "Name: A → Z" },
    { value: "name_desc", label: "Name: Z → A" },
];

// Renders an interactive marketplace allowing investors to discover, connect with, and invest in startups.
export default function StartupMarketplacePage() {
    const navigate = useNavigate();

    // ── Data State ──
    const [startups, setStartups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const [actionLoading, setActionLoading] = useState({});
    const [amounts, setAmounts] = useState({});
    const [loadingInvestment, setLoadingInvestment] = useState({});

    // ── Search & Sort State ──
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    // ── Pagination ──
    const [currentPage, setCurrentPage] = useState(1);

    // ── Fetch Startups ──
    const fetchStartups = useCallback(async () => {
        if (!session.get("access")) {
            setFetchError("Not authenticated. Please log in.");
            setLoading(false);
            navigate("/login");
            return;
        }

        try {
            setFetchError("");
            const response = await API.get("startups/");
            if (response && response.data && Array.isArray(response.data)) {
                setStartups(response.data);
            } else {
                setStartups([]);
                if (response.data && response.data.error) {
                    setFetchError(response.data.error);
                }
            }
        } catch (err) {
            console.error("Failed to load startup marketplace feed", err);
            setFetchError(
                err.response?.data?.error || "Failed to load active startup pitches."
            );
            setStartups([]);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchStartups();
    }, [fetchStartups]);

    // ── Connection Handler ──
    const handleConnectRequest = async (targetUserId, startupId) => {
        setActionLoading((prev) => ({ ...prev, [startupId]: true }));
        try {
            await API.post("connections/", {
                action: "send",
                receiver_id: targetUserId,
            });
            await fetchStartups();
        } catch (err) {
            console.error("Connection Error", err);
        } finally {
            setActionLoading((prev) => ({ ...prev, [startupId]: false }));
        }
    };

    // ── Investment Handler ──
    const invest = async (startup) => {
        const amount = amounts[startup.id];
        if (!amount || Number(amount) <= 0) {
            alert("Enter a valid investment amount.");
            return;
        }
        try {
            setLoadingInvestment((prev) => ({ ...prev, [startup.id]: true }));
            await API.post("invest/", {
                startup_id: startup.user_id,
                amount: Number(amount),
            });
            alert("🎉 Investment Successful!");
            setAmounts((prev) => ({ ...prev, [startup.id]: "" }));
            fetchStartups();
        } catch (err) {
            alert(err.response?.data?.error || "Investment failed.");
        } finally {
            setLoadingInvestment((prev) => ({ ...prev, [startup.id]: false }));
        }
    };

    // ── Filtered & Sorted Results ──
    const filteredStartups = useMemo(() => {
        let result = [...startups];

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (s) =>
                    (s.company_name || "").toLowerCase().includes(q) ||
                    (s.industry || "").toLowerCase().includes(q) ||
                    (s.pitch_description || "").toLowerCase().includes(q)
            );
        }

        // Sort
        if (sortBy === "funding_high") {
            result.sort(
                (a, b) => Number(b.funding_goal || 0) - Number(a.funding_goal || 0)
            );
        } else if (sortBy === "funding_low") {
            result.sort(
                (a, b) => Number(a.funding_goal || 0) - Number(b.funding_goal || 0)
            );
        } else if (sortBy === "name_asc") {
            result.sort((a, b) =>
                (a.company_name || "").localeCompare(b.company_name || "")
            );
        } else if (sortBy === "name_desc") {
            result.sort((a, b) =>
                (b.company_name || "").localeCompare(a.company_name || "")
            );
        }
        // "newest" = default API order

        return result;
    }, [startups, searchQuery, sortBy]);

    // ── Pagination Logic ──
    const totalPages = Math.max(1, Math.ceil(filteredStartups.length / ITEMS_PER_PAGE));
    const paginatedStartups = filteredStartups.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when search/sort change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, sortBy]);

    const clearSearch = () => {
        setSearchQuery("");
        setSortBy("newest");
    };

    // ── Render ──
    return (
        <DashboardLayout>
            {/* Hero */}
            <DashboardHero
                title="Explore Startups"
                subtitle="Discover promising startups and find your next investment opportunity."
            />

            {/* Toolbar: Search + Sort */}
            <div className="marketplace-toolbar">
                <div className="marketplace-search-wrapper">
                    <Search size={18} className="marketplace-search-icon" />
                    <input
                        type="text"
                        className="marketplace-search-input"
                        placeholder="Search by startup name, industry, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button
                            className="marketplace-search-clear"
                            onClick={() => setSearchQuery("")}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                <select
                    className="marketplace-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Results Meta */}
            {!loading && !fetchError && (
                <div className="marketplace-results-meta">
                    <span>
                        Showing <strong>{paginatedStartups.length}</strong> of{" "}
                        <strong>{filteredStartups.length}</strong> startups
                    </span>
                    {searchQuery && (
                        <span className="marketplace-results-query">
                            for "<strong>{searchQuery}</strong>"
                        </span>
                    )}
                </div>
            )}

            {/* Error */}
            {fetchError && (
                <div className="error-banner">⚠️ {fetchError}</div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="marketplace-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="marketplace-skeleton">
                            <div className="skeleton-top">
                                <div className="skeleton-badge" />
                                <div className="skeleton-badge short" />
                            </div>
                            <div className="skeleton-title" />
                            <div className="skeleton-text" />
                            <div className="skeleton-text short" />
                            <div className="skeleton-funding" />
                            <div className="skeleton-btn" />
                        </div>
                    ))}
                </div>
            ) : paginatedStartups.length === 0 ? (
                /* Empty State */
                <motion.div
                    className="marketplace-empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="marketplace-empty-icon">
                        <Rocket size={48} />
                    </div>
                    <h3>No startups found</h3>
                    <p>
                        {searchQuery
                            ? "Try adjusting your search to find more results."
                            : "Check back later for new investment opportunities."}
                    </p>
                    {searchQuery && (
                        <button className="marketplace-clear-btn" onClick={clearSearch}>
                            Clear Search
                        </button>
                    )}
                </motion.div>
            ) : (
                /* Startup Cards */
                <div className="marketplace-grid">
                    {paginatedStartups.map((startup, index) => (
                        <motion.div
                            key={startup.id}
                            className="startup-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.04 }}
                        >
                            <div className="card-top">
                                <span className="industry-badge">
                                    {startup.industry || "Startup"}
                                </span>
                                <span className="status-badge">
                                    {startup.connection_status || "Open"}
                                </span>
                            </div>

                            <h3 className="company-name">
                                {startup.company_name}
                                {startup.is_verified && (
                                    <BadgeCheck
                                        size={16}
                                        style={{
                                            marginLeft: 6,
                                            color: "var(--primary)",
                                            verticalAlign: "middle",
                                        }}
                                    />
                                )}
                            </h3>

                            <p className="company-description">
                                {startup.pitch_description || "No description provided."}
                            </p>

                            <div className="funding-box">
                                <span className="funding-label">Funding Goal</span>
                                <span className="funding-value">
                                    ₹{Number(startup.funding_goal || 0).toLocaleString()}
                                </span>
                            </div>

                            {/* View Profile */}
                            <button
                                className="connect-btn"
                                style={{
                                    background: "#2563eb",
                                    marginTop: "12px",
                                    marginBottom: "10px",
                                }}
                                onClick={() =>
                                    navigate(`/startup-profile/${startup.user_id}`)
                                }
                            >
                                👁 View Profile
                            </button>

                            {/* Connection / Invest */}
                            {startup.connection_status === "" ? (
                                <button
                                    className="connect-btn"
                                    onClick={() =>
                                        handleConnectRequest(startup.user_id, startup.id)
                                    }
                                    disabled={actionLoading[startup.id]}
                                >
                                    {actionLoading[startup.id]
                                        ? "Sending..."
                                        : "Connect"}
                                </button>
                            ) : startup.connection_status === "pending" ? (
                                <button className="pending-btn" disabled>
                                    Request Pending
                                </button>
                            ) : startup.connection_status === "accepted" ? (
                                <>
                                    <button className="connected-btn" disabled>
                                        ✅ Connected
                                    </button>

                                    <input
                                        type="number"
                                        placeholder="Enter investment amount"
                                        value={amounts[startup.id] || ""}
                                        onChange={(e) =>
                                            setAmounts((prev) => ({
                                                ...prev,
                                                [startup.id]: e.target.value,
                                            }))
                                        }
                                        style={{
                                            width: "100%",
                                            marginTop: "12px",
                                            padding: "10px",
                                            borderRadius: "10px",
                                            border: "1px solid var(--border)",
                                            background: "var(--surface)",
                                            color: "var(--text)",
                                        }}
                                    />

                                    <button
                                        className="connect-btn"
                                        style={{ marginTop: "10px" }}
                                        disabled={loadingInvestment[startup.id]}
                                        onClick={() => invest(startup)}
                                    >
                                        {loadingInvestment[startup.id]
                                            ? "Investing..."
                                            : "💰 Invest Now"}
                                    </button>
                                </>
                            ) : (
                                <button className="declined-btn" disabled>
                                    Declined
                                </button>
                            )}

                            {/* Message — only when connected */}
                            {startup.connection_status === "accepted" && (
                                <button
                                    className="connect-btn"
                                    style={{
                                        background: "var(--success)",
                                        marginTop: "8px",
                                    }}
                                    onClick={() => navigate(`/chat/${startup.user_id}`)}
                                >
                                    💬 Message
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && filteredStartups.length > ITEMS_PER_PAGE && (
                <div className="marketplace-pagination">
                    <button
                        className="marketplace-page-btn"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={16} />
                        Previous
                    </button>

                    <div className="marketplace-page-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((page) => {
                                // Show first, last, current, and neighbors
                                return (
                                    page === 1 ||
                                    page === totalPages ||
                                    Math.abs(page - currentPage) <= 1
                                );
                            })
                            .map((page, idx, arr) => (
                                <React.Fragment key={page}>
                                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                                        <span className="marketplace-page-ellipsis">...</span>
                                    )}
                                    <button
                                        className={`marketplace-page-num ${
                                            currentPage === page ? "active" : ""
                                        }`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                </React.Fragment>
                            ))}
                    </div>

                    <button
                        className="marketplace-page-btn"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
}
