import React from "react";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    ShieldAlert,
    TrendingUp,
    AlertTriangle,
    Lock,
    Crown,
    Sparkles,
} from "lucide-react";

/**
 * ReportRenderer — Shared component for displaying AI report JSON.
 * Used by both ReportDetail (saved reports) and can be reused anywhere.
 *
 * Props:
 *   report    — the parsed AI JSON object
 *   isPremium — whether the user has premium (controls section locking)
 */
// Parses and renders complex AI JSON report data into stylized, interactive UI sections with premium locking support.
export default function ReportRenderer({ report, isPremium = false }) {
    if (!report) return null;

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
        Business_Model_Canvas: "🧩 Business Model Canvas",
        Investor_Readiness: "🚀 Investor Readiness",
        MVP_Features: "🛠️ MVP Features",
        Funding_Strategy: "💎 Funding Strategy",
    };

    // ── Text Parsing Utilities ──

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
                            <motion.div key={item.num} style={styles.timelineItem}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}>
                                <div style={styles.timelineLeft}>
                                    <div style={styles.timelineNode}>{item.num}</div>
                                    {index < parsedTimeline.items.length - 1 && <div style={styles.timelineLine} />}
                                </div>
                                <motion.div style={styles.timelineContentCard}
                                    whileHover={{ x: 4, borderColor: "var(--primary)" }}>
                                    <h4 style={styles.timelineTitle}>
                                        {item.markerName} {item.num}: {parseBoldText(item.title)}
                                    </h4>
                                    <p style={styles.timelineDesc}>{parseBoldText(item.desc)}</p>
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
                            <motion.div key={item.num} style={styles.numberedCard}
                                whileHover={{ y: -4, boxShadow: "var(--shadow)", borderColor: "var(--primary)" }}
                                transition={{ duration: 0.2 }}>
                                <div style={styles.numberedHeader}>
                                    <div style={styles.numberedBadge}>{item.num.padStart(2, "0")}</div>
                                    <h4 style={styles.numberedTitle}>{parseBoldText(item.title)}</h4>
                                </div>
                                <p style={styles.numberedDesc}>{parseBoldText(item.desc)}</p>
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
                        return (
                            <div key={index} style={styles.textBulletRow}>
                                <span style={styles.textBulletPoint}>•</span>
                                <span style={styles.textBulletContent}>{parseBoldText(match[2])}</span>
                            </div>
                        );
                    }
                    return <p key={index} style={styles.defaultText}>{parseBoldText(trimmed)}</p>;
                })}
            </div>
        );
    };

    // ── Content Renderers ──

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
                                    <h4 style={styles.genericObjectKey}>{subKey.replaceAll("_", " ")}</h4>
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
            try { parsedValue = JSON.parse(value); } catch (e) {}
        }

        // SWOT
        if (key === "swot_analysis" && typeof parsedValue === "object" && parsedValue !== null) {
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
                            <div key={title} style={{ ...styles.swotCard, backgroundColor: styleConfig.bg, borderColor: styleConfig.border }}>
                                <div style={styles.swotHeader}>
                                    <IconComponent size={20} color={styleConfig.text} />
                                    <h4 style={{ ...styles.swotTitle, color: styleConfig.text }}>{title}</h4>
                                </div>
                                <ul style={styles.swotList}>
                                    {Array.isArray(items) ? items.map((item, i) => (
                                        <li key={i} style={styles.swotListItem}>{item}</li>
                                    )) : <li>{String(items)}</li>}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            );
        }

        // Risk Assessment
        if (key === "risk_assessment" && typeof parsedValue === "object" && parsedValue !== null) {
            return (
                <div style={styles.riskGrid}>
                    {Object.entries(parsedValue).map(([title, text]) => {
                        let severity = "Medium";
                        let severityColor = "var(--warning)";
                        let severityBg = "var(--warning-glow)";
                        const lowerTitle = title.toLowerCase();
                        if (lowerTitle.includes("market") || lowerTitle.includes("financial") || lowerTitle.includes("high")) {
                            severity = "High"; severityColor = "var(--error)"; severityBg = "var(--error-glow)";
                        } else if (lowerTitle.includes("legal") || lowerTitle.includes("low")) {
                            severity = "Low"; severityColor = "var(--success)"; severityBg = "var(--success-glow)";
                        }
                        return (
                            <div key={title} style={styles.riskCard}>
                                <div style={styles.riskHeader}>
                                    <h4 style={styles.riskTitle}>{title.replaceAll("_", " ")}</h4>
                                    <span style={{ ...styles.riskBadge, color: severityColor, backgroundColor: severityBg, border: `1px solid ${severityColor}20` }}>
                                        {severity} Risk
                                    </span>
                                </div>
                                <p style={styles.riskText}>{typeof text === 'string' ? text : JSON.stringify(text)}</p>
                            </div>
                        );
                    })}
                </div>
            );
        }

        return renderGenericContent(parsedValue);
    };

    // ── Main Render ──

    return (
        <div style={styles.sectionsContainer}>
            {Object.entries(report).map(([key, value], index) => {
                const visibleSections = ["market_analysis", "swot_analysis"];
                const isLocked = !isPremium && !visibleSections.includes(key);

                return (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="dashboard-card"
                        style={{ ...styles.sectionCard, position: "relative", overflow: "hidden" }}
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
            })}
        </div>
    );
}

// ── Styles ── (identical to StartupStrategy rendering styles)

const styles = {
    sectionsContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "0px",
    },
    sectionCard: {
        border: "1px solid var(--border-glass)",
        boxShadow: "var(--shadow)",
        padding: "30px",
    },
    sectionCardHeader: {
        borderBottom: "1px solid var(--border)",
        paddingBottom: "16px",
        marginBottom: "24px",
    },
    sectionTitleText: {
        fontSize: "18px",
        fontWeight: "800",
        margin: 0,
        color: "var(--text)",
    },
    sectionBody: { width: "100%" },

    // SWOT
    swotGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" },
    swotCard: { padding: "20px", borderRadius: "16px", border: "1px solid transparent", textAlign: "left" },
    swotHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" },
    swotTitle: { margin: 0, fontSize: "15px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px" },
    swotList: { margin: 0, paddingLeft: "18px", color: "var(--text)", fontSize: "14px", lineHeight: "1.6" },
    swotListItem: { marginBottom: "8px" },

    // Risk
    riskGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" },
    riskCard: { background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", textAlign: "left" },
    riskHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "12px" },
    riskTitle: { margin: 0, fontSize: "15px", fontWeight: "800", color: "var(--text)", textTransform: "capitalize" },
    riskBadge: { padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap" },
    riskText: { margin: 0, fontSize: "13.5px", color: "var(--text-light)", lineHeight: "1.6" },

    // Timeline
    timelineContainer: { display: "flex", flexDirection: "column", gap: "0px", textAlign: "left", paddingLeft: "10px" },
    timelineItem: { display: "flex", gap: "24px", position: "relative" },
    timelineLeft: { display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 },
    timelineNode: { width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--secondary))", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "800", fontSize: "14px", boxShadow: "var(--shadow-glow)", zIndex: 2 },
    timelineLine: { width: "2px", flex: 1, background: "linear-gradient(to bottom, var(--primary), var(--border))", margin: "8px 0", minHeight: "40px" },
    timelineContentCard: { flex: 1, background: "var(--surface-glass)", border: "1px solid var(--border-glass)", borderRadius: "16px", padding: "20px 24px", marginBottom: "24px", boxShadow: "var(--shadow-sm)", transition: "all 0.25s ease" },
    timelineTitle: { margin: "0 0 8px 0", fontSize: "16px", fontWeight: "800", color: "var(--text)" },
    timelineDesc: { margin: 0, fontSize: "13.5px", color: "var(--text-light)", lineHeight: "1.6" },

    // Numbered
    numberedGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", textAlign: "left" },
    numberedCard: { background: "var(--surface-glass)", border: "1px solid var(--border-glass)", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: "12px", transition: "all 0.2s ease" },
    numberedHeader: { display: "flex", alignItems: "center", gap: "12px" },
    numberedBadge: { width: "32px", height: "32px", borderRadius: "10px", background: "var(--primary-glow)", color: "var(--primary)", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "800", fontSize: "13px", flexShrink: 0 },
    numberedTitle: { margin: 0, fontSize: "15px", fontWeight: "800", color: "var(--text)", lineHeight: "1.3" },
    numberedDesc: { margin: 0, fontSize: "13.5px", color: "var(--text-light)", lineHeight: "1.6" },

    // Bullet text
    textBulletRow: { display: "flex", alignItems: "flex-start", gap: "8px", paddingLeft: "8px", margin: "2px 0" },
    textBulletPoint: { color: "var(--primary)", fontWeight: "bold", fontSize: "16px", lineHeight: "1.2" },
    textBulletContent: { fontSize: "14px", color: "var(--text-light)", lineHeight: "1.6", textAlign: "left" },

    // Generic
    bulletList: { margin: 0, paddingLeft: "20px", color: "var(--text)", lineHeight: "1.6" },
    bulletListItem: { marginBottom: "8px", fontSize: "14px" },
    genericObjectContainer: { display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" },
    genericObjectRow: { display: "flex", flexDirection: "column", gap: "4px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "14px 18px" },
    genericObjectKey: { margin: 0, fontSize: "14px", fontWeight: "800", color: "var(--primary)", textTransform: "capitalize" },
    genericObjectValue: { fontSize: "13.5px", color: "var(--text-light)", lineHeight: "1.5" },

    // Lock overlay
    lockOverlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "rgba(15, 23, 42, 0.03)", backdropFilter: "blur(4px)", pointerEvents: "none", zIndex: 10 },

    // Default text
    defaultText: { margin: 0, fontSize: "14.5px", color: "var(--text)", lineHeight: "1.7", whiteSpace: "pre-wrap" },
};
