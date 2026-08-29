import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    BrainCircuit, 
    Sparkles, 
    Loader2, 
    TrendingUp, 
    TrendingDown, 
    Compass, 
    AlertTriangle, 
    ShieldAlert,
    CheckCircle2,
    Activity,
    Target,
    HelpCircle,
    Crown,
    Lock,
    Download,
    Mail,
} from "lucide-react";
import API from "../api";
import DashboardLayout from "./layout/DashboardLayout";
import UpgradeButton from "./UpgradeButton";
import PDFLoadingModal from "./PDFLoadingModal";
import Toast from "./Toast";
import "../styles/reports.css";

// Renders the AI strategy interface, handling report generation, premium unlocks, and document exports.
function StartupStrategy() {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPremium, setIsPremium] = useState(false);

    // Export states
    const [pdfLoading, setPdfLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

    const fetchProfile = async () => {
        try {
            const res = await API.get("profile/");
            setIsPremium(res.data.is_premium || false);
        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const sectionTitles = {
        market_analysis: "📊 Market Analysis",
        swot_analysis: "⚔️ SWOT Analysis",
        financial_roadmap: "💰 Financial Roadmap",
        growth_strategy: "📈 Growth Strategy",
        target_audience: "🎯 Target Audience",
        revenue_model: "💵 Revenue Model",
        competition_analysis: "🏆 Competition Analysis",
        marketing_tactics: "📢 Marketing Strategy",
        operational_plan: "⚙️ Operational Plan",
        risk_assessment: "⚠️ Risk Assessment",
    };

    const generateReport = async () => {
        setLoading(true);
        try {
            const res = await API.post("generate-analysis/");
            setReport(res.data.data);
        } catch (err) {
            console.error(err);
            const errorMsg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message;
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // ── Download Latest PDF ──
    const handleDownload = useCallback(async () => {
        if (pdfLoading) return;
        setPdfLoading(true);

        try {
            const response = await API.get("../reports/latest/download/", {
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
            setPdfLoading(false);
        }
    }, [pdfLoading]);

    // ── Email Latest Report ──
    const handleEmail = useCallback(async () => {
        if (emailLoading) return;
        setEmailLoading(true);

        try {
            const res = await API.post("../reports/latest/email/");
            setToast({
                visible: true,
                message: `Report emailed to ${res.data.email} ✓`,
                type: "success",
            });
        } catch (err) {
            console.error("Email failed:", err);
            setToast({ visible: true, message: "Failed to send email", type: "error" });
        } finally {
            setEmailLoading(false);
        }
    }, [emailLoading]);

    const extractTitleAndDesc = (content, defaultTitle) => {
        let cleanContent = content.trim();

        const colonIndex = cleanContent.indexOf(":");
        const dashMatch = cleanContent.match(/\s+[-–—]\s+/);
        const dashIndex = dashMatch ? dashMatch.index : -1;
        const dashLength = dashMatch ? dashMatch[0].length : 0;

        let title = defaultTitle;
        let desc = cleanContent;

        if (colonIndex !== -1 && (dashIndex === -1 || colonIndex < dashIndex)) {
            title = cleanContent.substring(0, colonIndex).trim();
            desc = cleanContent.substring(colonIndex + 1).trim();
        } else if (dashIndex !== -1) {
            title = cleanContent.substring(0, dashIndex).trim();
            desc = cleanContent.substring(dashIndex + dashLength).trim();
        } else {
            const dotIndex = cleanContent.indexOf(".");
            if (dotIndex !== -1 && dotIndex < 60) {
                title = cleanContent.substring(0, dotIndex).trim();
                desc = cleanContent.substring(dotIndex + 1).trim();
            }
        }

        title = title.replace(/^\s*[\(\[\{-]\s*/, "").replace(/\s*[\)\]\} -]\s*$/, "").trim();
        desc = desc.replace(/^\s*[\(\[\{-]\s*/, "").replace(/\s*[\)\]\} -]\s*$/, "").trim();

        return { title, desc };
    };

    const parseTimeline = (text) => {
        if (typeof text !== "string") return null;

        const markers = [
            { name: "Phase", regex: /\bPhase\s+1[:\-]/i, splitRegex: /\bPhase\s+(\d+)[:\-]\s+([^]+?)(?=\s*\bPhase\s+\d+[:\-]|$)/gi },
            { name: "Year", regex: /\bYear\s+1[:\-]/i, splitRegex: /\bYear\s+(\d+)[:\-]\s+([^]+?)(?=\s*\bYear\s+\d+[:\-]|$)/gi },
            { name: "Q", regex: /\bQ1[:\-]/i, splitRegex: /\bQ(\d+)[:\-]\s+([^]+?)(?=\s*\bQ\d+[:\-]|$)/gi },
            { name: "Milestone", regex: /\bMilestone\s+1[:\-]/i, splitRegex: /\bMilestone\s+(\d+)[:\-]\s+([^]+?)(?=\s*\bMilestone\s+\d+[:\-]|$)/gi }
        ];

        let activeMarker = markers.find(m => m.regex.test(text) && new RegExp("\\b" + m.name + "\\s+2\\b", "i").test(text));
        
        if (!activeMarker) {
            if (/\bQ1[:\-]/i.test(text) && /\bQ2[:\-]/i.test(text)) {
                activeMarker = { name: "Q", regex: /\bQ1[:\-]/i, splitRegex: /\bQ(\d+)[:\-]\s+([^]+?)(?=\s*\bQ\d+[:\-]|$)/gi };
            } else {
                return null;
            }
        }

        const firstIndex = text.search(activeMarker.regex);
        const prefix = text.substring(0, firstIndex).trim();
        const timelineText = text.substring(firstIndex);

        const items = [];
        let match;
        activeMarker.splitRegex.lastIndex = 0;
        while ((match = activeMarker.splitRegex.exec(timelineText)) !== null) {
            const num = match[1];
            const content = match[2].trim();
            
            const { title, desc } = extractTitleAndDesc(content, `${activeMarker.name} ${num}`);
            
            items.push({ num, title, desc, markerName: activeMarker.name });
        }

        return { prefix, items };
    };

    const parseNumberedPoints = (text) => {
        if (typeof text !== "string") return null;

        const hasNumberedPoints = text.includes("1. ") && text.includes("2. ");
        if (!hasNumberedPoints) return null;

        const firstIndex = text.indexOf("1.");
        const prefix = text.substring(0, firstIndex).trim();
        const pointsText = text.substring(firstIndex);

        const regex = /(\d+)\.\s+([^]+?)(?=\s+\d+\.|$)/g;
        const items = [];
        let match;
        
        while ((match = regex.exec(pointsText)) !== null) {
            const num = match[1];
            const content = match[2].trim();
            
            const { title, desc } = extractTitleAndDesc(content, `Point ${num}`);
            
            items.push({ num, title, desc });
        }

        return { prefix, items };
    };

    const parseBoldText = (text) => {
        if (typeof text !== "string") return text;
        
        const parts = text.split(/\*\*+/);
        return parts.map((part, i) => {
            if (i % 2 === 1) {
                return <strong key={i} style={{ fontWeight: "800", color: "var(--text)" }}>{part}</strong>;
            }
            return part;
        });
    };

    const formatParagraphText = (text) => {
        if (typeof text !== "string") return text;

        const parsedTimeline = parseTimeline(text);
        if (parsedTimeline) {
            return (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {parsedTimeline.prefix && (
                        <p style={{ ...styles.defaultText, marginBottom: "8px" }}>
                            {parseBoldText(parsedTimeline.prefix)}
                        </p>
                    )}
                    <div style={styles.timelineContainer}>
                        {parsedTimeline.items.map((item, index) => (
                            <motion.div 
                                key={item.num} 
                                style={styles.timelineItem}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div style={styles.timelineLeft}>
                                    <div style={styles.timelineNode}>
                                        {item.num}
                                    </div>
                                    {index < parsedTimeline.items.length - 1 && (
                                        <div style={styles.timelineLine} />
                                    )}
                                </div>
                                <motion.div 
                                    style={styles.timelineContentCard}
                                    whileHover={{ x: 4, borderColor: "var(--primary)" }}
                                >
                                    <h4 style={styles.timelineTitle}>
                                        {item.markerName} {item.num}: {parseBoldText(item.title)}
                                    </h4>
                                    <p style={styles.timelineDesc}>
                                        {parseBoldText(item.desc)}
                                    </p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            );
        }

        const parsed = parseNumberedPoints(text);
        if (parsed) {
            return (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {parsed.prefix && (
                        <p style={{ ...styles.defaultText, marginBottom: "4px" }}>
                            {parseBoldText(parsed.prefix)}
                        </p>
                    )}
                    <div style={styles.numberedGrid}>
                        {parsed.items.map((item) => (
                            <motion.div 
                                key={item.num} 
                                style={styles.numberedCard}
                                whileHover={{ y: -4, boxShadow: "var(--shadow)", borderColor: "var(--primary)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <div style={styles.numberedHeader}>
                                    <div style={styles.numberedBadge}>
                                        {item.num.padStart(2, "0")}
                                    </div>
                                    <h4 style={styles.numberedTitle}>
                                        {parseBoldText(item.title)}
                                    </h4>
                                </div>
                                <p style={styles.numberedDesc}>
                                    {parseBoldText(item.desc)}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            );
        }

        const lines = text.split(/\n+/);

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
                {lines.map((line, index) => {
                    const trimmed = line.trim();
                    if (!trimmed) return null;

                    const bulletRegex = /^([-\*•]|\d+\.)\s+(.*)$/;
                    const match = trimmed.match(bulletRegex);

                    if (match) {
                        const content = match[2];
                        return (
                            <div key={index} style={styles.textBulletRow}>
                                <span style={styles.textBulletPoint}>•</span>
                                <span style={styles.textBulletContent}>{parseBoldText(content)}</span>
                            </div>
                        );
                    }

                    return (
                        <p key={index} style={styles.defaultText}>
                            {parseBoldText(trimmed)}
                        </p>
                    );
                })}
            </div>
        );
    };

    const renderGenericContent = (value) => {
        if (Array.isArray(value)) {
            return (
                <ul style={styles.bulletList}>
                    {value.map((item, i) => (
                        <li key={i} style={styles.bulletListItem}>
                            {typeof item === "object" ? renderGenericContent(item) : formatParagraphText(item)}
                        </li>
                    ))}
                </ul>
            );
        }

        if (typeof value === "object" && value !== null) {
            return (
                <div style={styles.genericObjectContainer}>
                    {Object.entries(value).map(([subKey, subVal]) => {
                        const isSingleCharKey = subKey.trim().length === 1 || /^\d+$/.test(subKey.trim());
                        
                        return (
                            <div key={subKey} style={styles.genericObjectRow}>
                                {!isSingleCharKey && (
                                    <h4 style={styles.genericObjectKey}>
                                        {subKey.replaceAll("_", " ")}
                                    </h4>
                                )}
                                <div style={styles.genericObjectValue}>
                                    {typeof subVal === "object" ? renderGenericContent(subVal) : formatParagraphText(subVal)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        return formatParagraphText(value);
    };

    const renderContent = (key, value) => {
        let parsedValue = value;
        if (typeof value === "string" && (value.trim().startsWith("{") || value.trim().startsWith("["))) {
            try {
                parsedValue = JSON.parse(value);
            } catch (e) {}
        }

        if (
            key === "swot_analysis" &&
            typeof parsedValue === "object" &&
            parsedValue !== null
        ) {
            const swotColors = {
                strengths: { bg: "rgba(16, 185, 129, 0.06)", border: "rgba(16, 185, 129, 0.15)", text: "var(--success)", icon: CheckCircle2 },
                weaknesses: { bg: "rgba(239, 68, 68, 0.06)", border: "rgba(239, 68, 68, 0.15)", text: "var(--error)", icon: ShieldAlert },
                opportunities: { bg: "rgba(99, 102, 241, 0.06)", border: "rgba(99, 102, 241, 0.15)", text: "var(--primary)", icon: TrendingUp },
                threats: { bg: "rgba(245, 158, 11, 0.06)", border: "rgba(245, 158, 11, 0.15)", text: "var(--warning)", icon: AlertTriangle }
            };

            return (
                <div style={styles.swotGrid}>
                    {Object.entries(parsedValue).map(([title, items]) => {
                        const styleConfig = swotColors[title.toLowerCase()] || swotColors.opportunities;
                        const IconComponent = styleConfig.icon;

                        return (
                            <div 
                                key={title} 
                                style={{
                                    ...styles.swotCard,
                                    backgroundColor: styleConfig.bg,
                                    borderColor: styleConfig.border
                                }}
                            >
                                <div style={styles.swotHeader}>
                                    <IconComponent size={20} color={styleConfig.text} />
                                    <h4 style={{ ...styles.swotTitle, color: styleConfig.text }}>
                                        {title}
                                    </h4>
                                </div>
                                <ul style={styles.swotList}>
                                    {items.map((item, i) => (
                                        <li key={i} style={styles.swotListItem}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            );
        }

        if (
            key === "risk_assessment" &&
            typeof parsedValue === "object" &&
            parsedValue !== null
        ) {
            return (
                <div style={styles.riskGrid}>
                    {Object.entries(parsedValue).map(([title, text]) => {
                        let severity = "Medium";
                        let severityColor = "var(--warning)";
                        let severityBg = "var(--warning-glow)";
                        
                        const lowerTitle = title.toLowerCase();
                        if (lowerTitle.includes("market") || lowerTitle.includes("financial") || lowerTitle.includes("high")) {
                            severity = "High";
                            severityColor = "var(--error)";
                            severityBg = "var(--error-glow)";
                        } else if (lowerTitle.includes("legal") || lowerTitle.includes("low")) {
                            severity = "Low";
                            severityColor = "var(--success)";
                            severityBg = "var(--success-glow)";
                        }

                        return (
                            <div key={title} style={styles.riskCard}>
                                <div style={styles.riskHeader}>
                                    <h4 style={styles.riskTitle}>
                                        {title.replaceAll("_", " ")}
                                    </h4>
                                    <span style={{
                                        ...styles.riskBadge,
                                        color: severityColor,
                                        backgroundColor: severityBg,
                                        border: `1px solid ${severityColor}20`
                                    }}>
                                        {severity} Risk
                                    </span>
                                </div>
                                <p style={styles.riskText}>{text}</p>
                            </div>
                        );
                    })}
                </div>
            );
        }

        return renderGenericContent(parsedValue);
    };

    return (
        <DashboardLayout>
            <div className="dashboard-content">
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="dashboard-card" 
                    style={styles.heroCard}
                >
                    <div style={styles.heroInfo}>
                        <div style={styles.aiIconWrapper}>
                            <BrainCircuit size={32} color="#fff" />
                        </div>
                        <div>
                            <h1 style={styles.mainHeading}>AI Business Intelligence</h1>
                            <p style={styles.subHeading}>
                                Generate deep AI-powered business roadmaps, SWOT analysis, and strategic recommendations tailored for your startup.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={generateReport}
                        disabled={loading}
                        className="connect-btn glass-panel-hover"
                        style={{
                            width: "auto",
                            minWidth: "260px",
                            padding: "14px 28px",
                            fontSize: "15px"
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                                Analyzing Business Model...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} />
                                {report ? "Refresh Strategic Analysis" : "Generate Strategy Report"}
                            </>
                        )}
                    </button>

                    {/* Export buttons — only visible when report exists */}
                    {report && (
                        <div className="report-export-row" style={{ marginLeft: "auto" }}>
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
                    )}
                </motion.div>

                <div style={styles.sectionsContainer}>
                    <AnimatePresence>
                        {report ? (
                            <>
                                {Object.entries(report).map(([key, value], index) => {
                                    const visibleSections = ["market_analysis", "swot_analysis"];
                                    const isLocked = !isPremium && !visibleSections.includes(key);
                                    
                                    const cardEl = (
                                        <motion.div
                                            key={key}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className="dashboard-card"
                                            style={{
                                                ...styles.sectionCard,
                                                position: "relative",
                                                overflow: "hidden"
                                            }}
                                        >
                                            <div style={{
                                                filter: isLocked ? "blur(5px)" : "none",
                                                pointerEvents: isLocked ? "none" : "auto",
                                                userSelect: isLocked ? "none" : "auto",
                                                transition: "filter 0.3s ease"
                                            }}>
                                                <div style={styles.sectionCardHeader}>
                                                    <h3 style={styles.sectionTitleText}>
                                                        {sectionTitles[key] || key.replaceAll("_", " ")}
                                                    </h3>
                                                </div>
                                                <div style={styles.sectionBody}>
                                                    {renderContent(key, value)}
                                                </div>
                                            </div>

                                            {isLocked && (
                                                <div style={styles.lockOverlay}>
                                                    <Lock size={28} style={{ color: "var(--primary)", marginBottom: "8px" }} />
                                                    <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-light)" }}>
                                                        Unlock with Premium Subscription
                                                    </span>
                                                </div>
                                            )}
                                        </motion.div>
                                    );

                                    if (key === "swot_analysis" && !isPremium) {
                                        return (
                                            <React.Fragment key={key}>
                                                {cardEl}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="dashboard-card"
                                                    style={styles.paywallCard}
                                                >
                                                    <div style={styles.paywallGlow} />
                                                    <div style={styles.paywallContent}>
                                                        <div style={styles.crownIconWrapper}>
                                                            <Crown size={32} color="#fff" />
                                                        </div>
                                                        <h2 style={styles.paywallTitle}>Unlock the Full Strategic Report</h2>
                                                        <p style={styles.paywallPrice}>₹299 <span style={{ fontSize: "14px", fontWeight: "normal", color: "var(--text-light)" }}>/ month</span></p>
                                                        
                                                        <div style={styles.benefitsGrid}>
                                                            <div style={styles.benefitItem}>
                                                                <Sparkles size={16} color="var(--primary)" />
                                                                <span>Unlimited AI Business Analysis</span>
                                                            </div>
                                                            <div style={styles.benefitItem}>
                                                                <Sparkles size={16} color="var(--primary)" />
                                                                <span>Full Unlocked Strategy Report</span>
                                                            </div>
                                                            <div style={styles.benefitItem}>
                                                                <Sparkles size={16} color="var(--primary)" />
                                                                <span>Download PDF Strategic Report</span>
                                                            </div>
                                                            <div style={styles.benefitItem}>
                                                                <Sparkles size={16} color="var(--primary)" />
                                                                <span>Priority updates & future AI features</span>
                                                            </div>
                                                        </div>

                                                        <UpgradeButton
                                                            onPremiumActivated={() => {
                                                                setIsPremium(true);
                                                            }}
                                                        />

                                                        <p style={{ fontSize: "11px", color: "var(--text-light)", marginTop: "12px", margin: 0 }}>
                                                            🔒 Secure payment via Razorpay. Cancel anytime.
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            </React.Fragment>
                                        );
                                    }

                                    return cardEl;
                                })}
                            </>
                        ) : (
                            !loading && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={styles.emptyState}
                                    className="glass-panel"
                                >
                                    <Compass size={48} style={{ color: "var(--text-lighter)", marginBottom: "16px" }} />
                                    <h3>No Strategy Report Active</h3>
                                    <p>Click the button above to let our AI analyze your profile, financials, and pitch details to build a strategic intelligence report.</p>
                                </motion.div>
                            )
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}} />

            {/* Loading Modal */}
            <PDFLoadingModal isOpen={pdfLoading} />

            {/* Toast */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.visible}
                onClose={() => setToast({ ...toast, visible: false })}
            />
        </DashboardLayout>
    );
}

const styles = {
    heroCard: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "24px",
        padding: "32px",
        marginBottom: "32px"
    },
    heroInfo: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
        flex: "1",
        minWidth: "300px"
    },
    aiIconWrapper: {
        width: "64px",
        height: "64px",
        borderRadius: "18px",
        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "var(--shadow-glow)",
        flexShrink: 0
    },
    mainHeading: {
        fontSize: "26px",
        fontWeight: "800",
        margin: "0 0 6px 0",
        letterSpacing: "-0.5px"
    },
    subHeading: {
        fontSize: "14px",
        color: "var(--text-light)",
        margin: 0,
        maxWidth: "550px"
    },
    sectionsContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "0px"
    },
    sectionCard: {
        border: "1px solid var(--border-glass)",
        boxShadow: "var(--shadow)",
        padding: "30px"
    },
    sectionCardHeader: {
        borderBottom: "1px solid var(--border)",
        paddingBottom: "16px",
        marginBottom: "24px"
    },
    sectionTitleText: {
        fontSize: "18px",
        fontWeight: "800",
        margin: 0,
        color: "var(--text)"
    },
    sectionBody: {
        width: "100%"
    },
    // SWOT
    swotGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px"
    },
    swotCard: {
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid transparent",
        textAlign: "left"
    },
    swotHeader: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "14px"
    },
    swotTitle: {
        margin: 0,
        fontSize: "15px",
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },
    swotList: {
        margin: 0,
        paddingLeft: "18px",
        color: "var(--text)",
        fontSize: "14px",
        lineHeight: "1.6"
    },
    swotListItem: {
        marginBottom: "8px"
    },
    // Risks
    riskGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px"
    },
    riskCard: {
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "20px",
        textAlign: "left"
    },
    riskHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        marginBottom: "12px"
    },
    riskTitle: {
        margin: 0,
        fontSize: "15px",
        fontWeight: "800",
        color: "var(--text)",
        textTransform: "capitalize"
    },
    riskBadge: {
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "700",
        whiteSpace: "nowrap"
    },
    riskText: {
        margin: 0,
        fontSize: "13.5px",
        color: "var(--text-light)",
        lineHeight: "1.6"
    },
    // Timeline Styles
    timelineContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "0px",
        textAlign: "left",
        paddingLeft: "10px"
    },
    timelineItem: {
        display: "flex",
        gap: "24px",
        position: "relative"
    },
    timelineLeft: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexShrink: 0
    },
    timelineNode: {
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--primary), var(--secondary))",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "800",
        fontSize: "14px",
        boxShadow: "var(--shadow-glow)",
        zIndex: 2
    },
    timelineLine: {
        width: "2px",
        flex: 1,
        background: "linear-gradient(to bottom, var(--primary), var(--border))",
        margin: "8px 0",
        minHeight: "40px"
    },
    timelineContentCard: {
        flex: 1,
        background: "var(--surface-glass)",
        border: "1px solid var(--border-glass)",
        borderRadius: "16px",
        padding: "20px 24px",
        marginBottom: "24px",
        boxShadow: "var(--shadow-sm)",
        transition: "all 0.25s ease"
    },
    timelineTitle: {
        margin: "0 0 8px 0",
        fontSize: "16px",
        fontWeight: "800",
        color: "var(--text)"
    },
    timelineDesc: {
        margin: 0,
        fontSize: "13.5px",
        color: "var(--text-light)",
        lineHeight: "1.6"
    },
    // Numbered Grid Styles
    numberedGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
        textAlign: "left"
    },
    numberedCard: {
        background: "var(--surface-glass)",
        border: "1px solid var(--border-glass)",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        transition: "all 0.2s ease"
    },
    numberedHeader: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },
    numberedBadge: {
        width: "32px",
        height: "32px",
        borderRadius: "10px",
        background: "var(--primary-glow)",
        color: "var(--primary)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "800",
        fontSize: "13px",
        flexShrink: 0
    },
    numberedTitle: {
        margin: 0,
        fontSize: "15px",
        fontWeight: "800",
        color: "var(--text)",
        lineHeight: "1.3"
    },
    numberedDesc: {
        margin: 0,
        fontSize: "13.5px",
        color: "var(--text-light)",
        lineHeight: "1.6"
    },
    // Bullet Text Styles
    textBulletRow: {
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        paddingLeft: "8px",
        margin: "2px 0"
    },
    textBulletPoint: {
        color: "var(--primary)",
        fontWeight: "bold",
        fontSize: "16px",
        lineHeight: "1.2"
    },
    textBulletContent: {
        fontSize: "14px",
        color: "var(--text-light)",
        lineHeight: "1.6",
        textAlign: "left"
    },
    // Generic Object/List Styles
    bulletList: {
        margin: 0,
        paddingLeft: "20px",
        color: "var(--text)",
        lineHeight: "1.6"
    },
    bulletListItem: {
        marginBottom: "8px",
        fontSize: "14px"
    },
    genericObjectContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        textAlign: "left"
    },
    genericObjectRow: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "14px 18px"
    },
    genericObjectKey: {
        margin: 0,
        fontSize: "14px",
        fontWeight: "800",
        color: "var(--primary)",
        textTransform: "capitalize"
    },
    genericObjectValue: {
        fontSize: "13.5px",
        color: "var(--text-light)",
        lineHeight: "1.5"
    },
    // Paywall Card
    paywallCard: {
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)",
        border: "1px solid var(--primary)",
        borderRadius: "20px",
        padding: "40px 30px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: "var(--shadow-lg)",
        marginBottom: "24px"
    },
    paywallGlow: {
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 60%)",
        pointerEvents: "none",
        zIndex: 0
    },
    paywallContent: {
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },
    crownIconWrapper: {
        width: "60px",
        height: "60px",
        borderRadius: "18px",
        background: "linear-gradient(135deg, #eab308, #ca8a04)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0 8px 20px -4px rgba(234, 179, 8, 0.4)",
        marginBottom: "20px"
    },
    paywallTitle: {
        fontSize: "22px",
        fontWeight: "800",
        margin: "0 0 8px 0",
        color: "var(--text)"
    },
    paywallPrice: {
        fontSize: "36px",
        fontWeight: "900",
        color: "var(--text)",
        margin: "12px 0 24px 0"
    },
    benefitsGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px 24px",
        maxWidth: "600px",
        marginBottom: "32px",
        textAlign: "left"
    },
    benefitItem: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "14px",
        color: "var(--text)",
        fontWeight: "600"
    },
    paywallBtn: {
        width: "100%",
        maxWidth: "320px",
        padding: "14px 28px",
        fontSize: "15px",
        fontWeight: "800",
        boxShadow: "var(--shadow-glow)"
    },
    lockOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(15, 23, 42, 0.03)",
        backdropFilter: "blur(4px)",
        pointerEvents: "none",
        zIndex: 10
    },
    // Razorpay Modal
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999
    },
    razorpayModal: {
        width: "360px",
        background: "var(--surface)",
        borderRadius: "12px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        overflow: "hidden",
        border: "1px solid var(--border)",
        fontFamily: "var(--font-sans)"
    },
    rzpHeader: {
        background: "#0b69ff",
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#fff"
    },
    rzpMerchant: {
        fontSize: "14px",
        fontWeight: "600",
        opacity: 0.9
    },
    rzpAmount: {
        fontSize: "24px",
        fontWeight: "800",
        marginTop: "4px"
    },
    rzpLogo: {
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        background: "rgba(255,255,255,0.2)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    rzpBody: {
        padding: "24px"
    },
    rzpContactRow: {
        background: "var(--bg)",
        padding: "8px 12px",
        borderRadius: "6px",
        textAlign: "center",
        marginBottom: "20px"
    },
    rzpTitle: {
        fontSize: "12px",
        fontWeight: "700",
        color: "var(--text-light)",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: "12px",
        textAlign: "left"
    },
    rzpMethods: {
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },
    rzpMethodItem: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        cursor: "pointer",
        transition: "background 0.2s"
    },
    rzpMethodIcon: {
        fontSize: "20px"
    },
    rzpMethodName: {
        fontSize: "13.5px",
        fontWeight: "700",
        color: "var(--text)"
    },
    rzpMethodDesc: {
        fontSize: "11px",
        color: "var(--text-light)",
        marginTop: "2px"
    },
    rzpFooter: {
        marginTop: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },
    rzpPayBtn: {
        background: "#0b69ff",
        color: "#fff",
        border: "none",
        padding: "12px",
        borderRadius: "6px",
        fontWeight: "700",
        fontSize: "14px",
        cursor: "pointer"
    },
    rzpCancelBtn: {
        background: "transparent",
        color: "var(--text-light)",
        border: "none",
        padding: "8px",
        cursor: "pointer",
        fontSize: "13px"
    },
    rzpLoaderContainer: {
        height: "200px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    successCheckmark: {
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        background: "#10b981",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "24px",
        fontWeight: "bold",
        boxShadow: "0 4px 12px rgba(16,185,129,0.3)"
    },
    // Default Texts
    defaultTextContainer: {
        textAlign: "left",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "24px"
    },
    defaultText: {
        margin: 0,
        fontSize: "14.5px",
        color: "var(--text)",
        lineHeight: "1.7",
        whiteSpace: "pre-wrap"
    },
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 40px",
        textAlign: "center",
        maxWidth: "500px",
        margin: "40px auto"
    }
};

export default StartupStrategy;