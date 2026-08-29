import React, { useState, useEffect, useCallback } from "react";
import API from "../../api";
import session from "../../session";
import "../../styles/funding-readiness.css";
import {
    ChevronDown,
    Sparkles,
    TrendingUp,
    Users,
    DollarSign,
    Flame,
    Activity,
    Globe,
    GraduationCap,
    RefreshCw,
    Save,
    Brain,
    Target,
    Shield,
    Clock,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────

// Maps numerical AI readiness scores to visually distinct semantic color codes for intuitive status indication.
function getScoreColor(score) {
    if (score >= 90) return "#059669";
    if (score >= 75) return "#2563eb";
    if (score >= 60) return "#d97706";
    if (score >= 40) return "#ea580c";
    return "#dc2626";
}

// Associates textual readiness classifications with corresponding CSS badge classes for consistent UI styling.
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

// Evaluates AI prediction confidence levels and assigns matching semantic CSS styling classes securely.
function getConfidenceClass(conf) {
    if (conf === "High") return "confidence-high";
    if (conf === "Medium") return "confidence-medium";
    return "confidence-low";
}

// ── Circular Score Component ─────────────────────────────────────────────

// Renders an animated SVG circular progress indicator displaying the calculated AI funding readiness score.
function ScoreCircle({ score }) {
    const radius = 65;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = getScoreColor(score);

    return (
        <div className="score-circle-wrapper">
            <svg className="score-circle-svg" viewBox="0 0 160 160">
                <circle className="score-circle-bg" cx="80" cy="80" r={radius} />
                <circle
                    className="score-circle-fill"
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={color}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="score-circle-text">
                <span className="score-value" style={{ color }}>
                    {Math.round(score)}
                </span>
                <span className="score-unit">%</span>
                <div className="score-subtitle">Score</div>
            </div>
        </div>
    );
}

// ── Main Component ───────────────────────────────────────────────────────

const FOUNDER_BG_OPTIONS = [
    { value: "first_time", label: "First Time Founder" },
    { value: "academic", label: "Academic" },
    { value: "serial_entrepreneur", label: "Serial Entrepreneur" },
    { value: "corporate", label: "Corporate" },
];

// Manages a comprehensive form allowing startups to generate AI-driven funding readiness predictions based on metrics.
export default function FundingReadinessForm() {
    // ── State ────────────────────────────────────────────────────────────
    const [isOpen, setIsOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [predicting, setPredicting] = useState(false);
    const [toast, setToast] = useState({ type: "", message: "" });

    const [formData, setFormData] = useState({
        funding_rounds: 0,
        founder_experience_years: 0,
        team_size: 1,
        monthly_revenue_rupees: 0,
        burn_rate_rupees: 0,
        product_traction_users: 0,
        market_size_billion: 0,
        founder_background: "first_time",
    });

    const [result, setResult] = useState(null); // prediction result

    // ── Load existing profile data ───────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            if (!session.get("access")) return;
            try {
                const res = await API.get("profile/");
                const d = res.data;
                setFormData({
                    funding_rounds: d.funding_rounds ?? 0,
                    founder_experience_years: d.founder_experience_years ?? 0,
                    team_size: d.team_size ?? 1,
                    monthly_revenue_rupees: d.monthly_revenue_rupees ?? 0,
                    burn_rate_rupees: d.burn_rate_rupees ?? 0,
                    product_traction_users: d.product_traction_users ?? 0,
                    market_size_billion: d.market_size_billion ?? 0,
                    founder_background: d.founder_background || "first_time",
                });

                // If there's a previous prediction, load it
                if (d.funding_readiness_score != null) {
                    setResult({
                        score: parseFloat(d.funding_readiness_score),
                        label: d.prediction_label,
                        confidence_label: d.prediction_confidence,
                        ai_summary: d.ai_prediction_summary,
                        last_prediction: d.last_prediction,
                    });
                }
            } catch (err) {
                console.error("Failed to load profile for funding readiness", err);
            }
        };
        load();
    }, []);

    // ── Auto-clear toasts ────────────────────────────────────────────────
    useEffect(() => {
        if (!toast.message) return;
        const t = setTimeout(() => setToast({ type: "", message: "" }), 4000);
        return () => clearTimeout(t);
    }, [toast]);

    // ── Handlers ─────────────────────────────────────────────────────────

    const handleChange = useCallback((e) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
        }));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await API.put("profile/", formData);
            setToast({ type: "success", message: "✅ Funding readiness data saved!" });
        } catch {
            setToast({ type: "error", message: "Failed to save data." });
        } finally {
            setSaving(false);
        }
    };

    const handlePredict = async () => {
        // Save first, then predict
        setPredicting(true);
        setResult(null);
        try {
            // Save the form data first
            await API.put("profile/", formData);

            // Run prediction
            const res = await API.post("predict-funding/");
            setResult(res.data);
            setToast({ type: "success", message: "🎯 Prediction complete!" });
        } catch (err) {
            const errMsg =
                err?.response?.data?.error ||
                "Prediction failed. Please try again.";
            setToast({ type: "error", message: errMsg });
        } finally {
            setPredicting(false);
        }
    };

    // ── Format last_prediction for display ───────────────────────────────
    const formatLastPrediction = (val) => {
        if (!val) return "Never";
        // If it's already a formatted string from the API response
        if (typeof val === "string" && !val.includes("T")) return val;
        // Otherwise parse ISO date
        try {
            return new Date(val).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return val;
        }
    };

    // ── Render ────────────────────────────────────────────────────────────

    return (
        <div className="funding-card">
            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="funding-header" onClick={() => setIsOpen(!isOpen)}>
                <div className="funding-header-left">
                    <div className="funding-header-icon">
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <h2>AI Funding Readiness</h2>
                        <p>ML-powered funding score & recommendations</p>
                    </div>
                </div>
                <button
                    className={`funding-toggle ${isOpen ? "open" : ""}`}
                    aria-label="Toggle card"
                >
                    <ChevronDown size={22} />
                </button>
            </div>

            {/* ── Body ────────────────────────────────────────────────── */}
            <div className={`funding-body ${isOpen ? "expanded" : ""}`}>
                {/* Toast */}
                {toast.message && (
                    <div className={`funding-toast ${toast.type}`}>{toast.message}</div>
                )}

                {/* Form Fields */}
                <div className="funding-form-grid">
                    <div className="funding-field">
                        <label>
                            <TrendingUp size={16} /> Funding Rounds
                        </label>
                        <input
                            type="number"
                            name="funding_rounds"
                            value={formData.funding_rounds}
                            onChange={handleChange}
                            min="0"
                            placeholder="e.g. 2"
                        />
                    </div>

                    <div className="funding-field">
                        <label>
                            <GraduationCap size={16} /> Founder Experience (Years)
                        </label>
                        <input
                            type="number"
                            name="founder_experience_years"
                            value={formData.founder_experience_years}
                            onChange={handleChange}
                            min="0"
                            placeholder="e.g. 5"
                        />
                    </div>

                    <div className="funding-field">
                        <label>
                            <Users size={16} /> Team Size
                        </label>
                        <input
                            type="number"
                            name="team_size"
                            value={formData.team_size}
                            onChange={handleChange}
                            min="1"
                            placeholder="e.g. 12"
                        />
                    </div>

                    <div className="funding-field">
                        <label>
                            <DollarSign size={16} /> Monthly Revenue (₹)
                        </label>
                        <input
                            type="number"
                            name="monthly_revenue_rupees"
                            value={formData.monthly_revenue_rupees}
                            onChange={handleChange}
                            min="0"
                            placeholder="e.g. 500000"
                        />
                    </div>

                    <div className="funding-field">
                        <label>
                            <Flame size={16} /> Monthly Burn Rate (₹)
                        </label>
                        <input
                            type="number"
                            name="burn_rate_rupees"
                            value={formData.burn_rate_rupees}
                            onChange={handleChange}
                            min="0"
                            placeholder="e.g. 300000"
                        />
                    </div>

                    <div className="funding-field">
                        <label>
                            <Activity size={16} /> Monthly Active Users
                        </label>
                        <input
                            type="number"
                            name="product_traction_users"
                            value={formData.product_traction_users}
                            onChange={handleChange}
                            min="0"
                            placeholder="e.g. 50000"
                        />
                    </div>

                    <div className="funding-field">
                        <label>
                            <Globe size={16} /> Market Size (Billion USD)
                        </label>
                        <input
                            type="number"
                            name="market_size_billion"
                            value={formData.market_size_billion}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            placeholder="e.g. 15.5"
                        />
                    </div>

                    <div className="funding-field">
                        <label>
                            <GraduationCap size={16} /> Founder Background
                        </label>
                        <select
                            name="founder_background"
                            value={formData.founder_background}
                            onChange={handleChange}
                        >
                            {FOUNDER_BG_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="funding-actions">
                    <button
                        className="funding-save-btn"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Save size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
                        {saving ? "Saving..." : "Save Data"}
                    </button>
                    <button
                        className="funding-predict-btn"
                        onClick={handlePredict}
                        disabled={predicting}
                    >
                        <Sparkles size={16} />
                        {predicting ? "Analyzing..." : "Run Prediction"}
                    </button>
                </div>

                {/* ── Loading State ───────────────────────────────────── */}
                {predicting && (
                    <div className="funding-loading">
                        <div className="funding-spinner" />
                        <p>Running AI analysis & generating insights...</p>
                    </div>
                )}

                {/* ── Results ─────────────────────────────────────────── */}
                {result && !predicting && (
                    <>
                        <hr className="funding-divider" />

                        <div className="funding-results">
                            <div className="funding-results-header">
                                <h3>
                                    <Target size={18} /> Prediction Results
                                </h3>
                                <button
                                    className="funding-refresh-btn"
                                    onClick={handlePredict}
                                    disabled={predicting}
                                >
                                    <RefreshCw size={14} />
                                    Refresh
                                </button>
                            </div>

                            <div className="funding-score-row">
                                {/* Circular Score */}
                                <ScoreCircle score={result.score} />

                                {/* Info Badges */}
                                <div className="funding-info-grid">
                                    <div className="funding-info-item">
                                        <span className="info-label">
                                            <Shield
                                                size={14}
                                                style={{
                                                    marginRight: 6,
                                                    verticalAlign: "middle",
                                                }}
                                            />
                                            Status
                                        </span>
                                        <span
                                            className={`funding-badge ${getBadgeClass(result.label)}`}
                                        >
                                            {result.label}
                                        </span>
                                    </div>

                                    <div className="funding-info-item">
                                        <span className="info-label">
                                            <Target
                                                size={14}
                                                style={{
                                                    marginRight: 6,
                                                    verticalAlign: "middle",
                                                }}
                                            />
                                            Confidence
                                        </span>
                                        <span
                                            className={`info-value ${getConfidenceClass(result.confidence_label)}`}
                                        >
                                            {result.confidence_label}
                                            {result.confidence != null &&
                                                ` (${Math.round(result.confidence)}%)`}
                                        </span>
                                    </div>

                                    <div className="funding-info-item">
                                        <span className="info-label">
                                            <Clock
                                                size={14}
                                                style={{
                                                    marginRight: 6,
                                                    verticalAlign: "middle",
                                                }}
                                            />
                                            Last Updated
                                        </span>
                                        <span className="info-value">
                                            {formatLastPrediction(result.last_prediction)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Explanation */}
                            {result.ai_summary && (
                                <div className="funding-explanation">
                                    <h4>
                                        <Brain size={16} /> AI Analysis
                                    </h4>
                                    <p>{result.ai_summary}</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
