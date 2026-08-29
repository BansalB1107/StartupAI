import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  Rocket, Sparkles, TrendingUp, Target, Users, DollarSign,
  BarChart3, MessageSquare, Bell, Settings, LogOut, ChevronRight,
  Download, Send, Zap, Globe, Shield, Star, ArrowUpRight,
  Layers, Cpu, Activity, RefreshCw, X, Check, AlertCircle, Home,
  BookOpen, PieChart, Briefcase, Menu, ChevronDown, Wand2,
  Lightbulb, Trophy, LayoutDashboard
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import session from "../session";

// ─── Helpers ────────────────────────────────────────────────────────────────

const cn = (...classes) => classes.filter(Boolean).join(" ");

// ─── AnimatedGradientMesh ────────────────────────────────────────────────────

// Renders an ambient, animated gradient mesh background using framer-motion to enhance dashboard aesthetics dynamically.
function GradientMesh() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Deep space base removed to allow global 3D ambient background to show through */}

      {/* Shifting gradient blobs */}
      <motion.div
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #3B82F6 0%, #1D4ED8 50%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 80, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-[800px] h-[800px] rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #2563EB 0%, #1E3A5F 50%, transparent 70%)",
          filter: "blur(100px)",
        }}
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 70, -50, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-8"
        style={{
          background: "radial-gradient(circle, #1D4ED8 0%, #0F172A 60%, transparent 70%)",
          filter: "blur(120px)",
        }}
        animate={{
          scale: [1, 1.3, 0.8, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut", delay: 7 }}
      />

      {/* Fine noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

// ─── Breathing AI Orb ───────────────────────────────────────────────────────

// Renders a breathing, animated 3D-style orb graphic representing active or idle AI generation states.
function AIOrb({ isGenerating }) {
  return (
    <div className="relative flex items-center justify-center w-48 h-48 mx-auto">
      {/* Outer rings */}
      {isGenerating && (
        <>
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-blue-400/20"
              style={{ width: `${100 + i * 40}px`, height: `${100 + i * 40}px` }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
            />
          ))}
        </>
      )}

      {/* Core orb */}
      <motion.div
        className="relative w-32 h-32 rounded-full"
        style={{
          background: isGenerating
            ? "conic-gradient(from 0deg, #3B82F6, #1D4ED8, #2563EB, #60A5FA, #3B82F6)"
            : "conic-gradient(from 0deg, #3B82F680, #1D4ED880, #2563EB80, #3B82F680)",
          boxShadow: isGenerating
            ? "0 0 60px 20px rgba(59, 130, 246, 0.3), 0 0 120px 40px rgba(29, 78, 216, 0.2)"
            : "0 0 30px 10px rgba(59, 130, 246, 0.15)",
        }}
        animate={
          isGenerating
            ? { rotate: 360, scale: [1, 1.08, 0.97, 1.05, 1] }
            : { scale: [1, 1.04, 1], rotate: 0 }
        }
        transition={
          isGenerating
            ? { rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1.5, repeat: Infinity } }
            : { scale: { duration: 3, repeat: Infinity, ease: "easeInOut" } }
        }
      >
        {/* Inner glass core */}
        <div
          className="absolute inset-2 rounded-full flex items-center justify-center"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.1), rgba(10,14,23,0.9))",
            backdropFilter: "blur(10px)",
          }}
        >
          <motion.div
            animate={isGenerating ? { rotate: -360 } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            {isGenerating ? (
              <Cpu className="w-10 h-10 text-blue-400" />
            ) : (
              <Sparkles className="w-10 h-10 text-blue-400" />
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Glass Card ──────────────────────────────────────────────────────────────

// Renders a reusable, frosted-glass stylized container component with optional hover animations and neon glow effects.
function GlassCard({ children, className = "", onClick, hover = true, glow }) {
  const glowColors = {
    cyan: "hover:shadow-[0_0_40px_rgba(59,130,246,0.12)]",
    magenta: "hover:shadow-[0_0_40px_rgba(59,130,246,0.12)]",
    orange: "hover:shadow-[0_0_40px_rgba(59,130,246,0.12)]",
    purple: "hover:shadow-[0_0_40px_rgba(59,130,246,0.12)]",
  };

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        "relative rounded-2xl border border-white/[0.07] overflow-hidden transition-all duration-300",
        hover && "cursor-pointer hover:scale-[1.02] hover:border-white/20",
        glow && glowColors[glow],
        className
      )}
      style={{
        background: "rgba(18,24,38,0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      whileHover={hover ? { y: -2 } : {}}
    >
      {/* Gradient border overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          padding: "1px",
          background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(30,41,59,0.05), rgba(59,130,246,0.08))",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      {children}
    </motion.div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

// Displays a styled metrics card summarizing numerical data points with optional percentage change indicators.
function StatCard({ icon: Icon, label, value, change, color }) {
  const colorMap = {
    cyan: { text: "text-blue-400", bg: "bg-blue-400/10", glow: "cyan" },
    magenta: { text: "text-blue-400", bg: "bg-blue-400/10", glow: "magenta" },
    orange: { text: "text-blue-400", bg: "bg-blue-400/10", glow: "orange" },
    purple: { text: "text-blue-400", bg: "bg-blue-400/10", glow: "purple" },
  };
  const c = colorMap[color] || colorMap.cyan;

  return (
    <GlassCard className="p-5" glow={c.glow}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl", c.bg)}>
          <Icon className={cn("w-5 h-5", c.text)} />
        </div>
        {change !== undefined && (
          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", change >= 0 ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10")}>
            {change >= 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
      <p className="text-white/40 text-xs font-medium tracking-widest uppercase mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </GlassCard>
  );
}

// ─── Gradient Button ─────────────────────────────────────────────────────────

// Renders a reusable, highly-styled gradient button supporting loading states, icons, and multiple size variants.
function GradientButton({ children, onClick, loading, variant = "primary", className = "", icon: Icon, size = "md" }) {
  const variants = {
    primary: "from-blue-500 via-blue-600 to-blue-700 hover:from-blue-400 hover:via-blue-500 hover:to-blue-600",
    magenta: "from-blue-500 via-blue-600 to-indigo-700 hover:from-blue-400 hover:via-blue-500 hover:to-indigo-600",
    orange: "from-blue-500 via-blue-600 to-blue-700 hover:from-blue-400 hover:via-blue-500 hover:to-blue-600",
    ghost: "from-white/10 via-white/5 to-white/10 hover:from-white/20 hover:via-white/15 hover:to-white/20",
  };
  const sizes = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-sm", lg: "px-8 py-4 text-base" };

  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "relative inline-flex items-center gap-2 font-semibold text-white rounded-xl bg-gradient-to-r transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={{ scale: loading ? 1 : 1.03 }}
      whileTap={{ scale: loading ? 1 : 0.97 }}
    >
      {/* Shimmer */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
          }}
        />
      </div>
      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
      {children}
    </motion.button>
  );
}

// ─── Startup Idea Card ───────────────────────────────────────────────────────

// Renders a detailed, modular overlay displaying the comprehensive ten-section AI-generated startup strategy report.
function StartupIdeaCard({ idea, onClose }) {
  const sections = [
    { key: "market_analysis", label: "Market Analysis", icon: BarChart3, color: "cyan" },
    { key: "swot_analysis", label: "SWOT Analysis", icon: Shield, color: "purple" },
    { key: "financial_roadmap", label: "Financial Roadmap", icon: DollarSign, color: "orange" },
    { key: "growth_strategy", label: "Growth Strategy", icon: TrendingUp, color: "magenta" },
    { key: "target_audience", label: "Target Audience", icon: Target, color: "cyan" },
    { key: "revenue_model", label: "Revenue Model", icon: PieChart, color: "purple" },
    { key: "competition_analysis", label: "Competition", icon: Trophy, color: "orange" },
    { key: "marketing_tactics", label: "Marketing", icon: Globe, color: "magenta" },
    { key: "operational_plan", label: "Operations", icon: Layers, color: "cyan" },
    { key: "risk_assessment", label: "Risk Assessment", icon: AlertCircle, color: "purple" },
  ];

  const colorMap = {
    cyan: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    purple: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    orange: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    magenta: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  };

  const [activeSection, setActiveSection] = useState(sections[0].key);

  const renderContent = (content) => {
    if (!content) return <p className="text-white/40 italic">No data available.</p>;
    if (typeof content === "string") return <p className="text-white/70 leading-relaxed text-sm">{content}</p>;
    if (Array.isArray(content)) {
      return (
        <ul className="space-y-2">
          {content.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/70">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              {typeof item === "string" ? item : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      );
    }
    if (typeof content === "object") {
      return (
        <div className="space-y-3">
          {Object.entries(content).map(([k, v]) => (
            <div key={k} className="space-y-1">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
                {k.replace(/_/g, " ")}
              </p>
              {renderContent(v)}
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-white/70 text-sm">{String(content)}</p>;
  };

  const activeData = idea[activeSection];
  const activeConfig = sections.find((s) => s.key === activeSection);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-4 z-50 flex flex-col"
    >
      {/* Backdrop blur */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(10,14,23,0.92)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
          }}
        />
        {/* Glowing border */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            padding: "1px",
            background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(30,41,59,0.15), rgba(59,130,246,0.2))",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full p-6 gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Strategy Report</h2>
              <p className="text-white/40 text-sm">Generated by StartupAI Intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200",
                activeSection === s.key
                  ? colorMap[s.color]
                  : "text-white/40 bg-white/5 border-white/10 hover:text-white/70 hover:bg-white/10"
              )}
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-y-auto"
          >
            <GlassCard className="p-6 h-full" hover={false}>
              <div className="flex items-center gap-3 mb-6">
                <div className={cn("p-2.5 rounded-xl border", colorMap[activeConfig?.color])}>
                  {activeConfig && <activeConfig.icon className="w-5 h-5" />}
                </div>
                <h3 className="text-lg font-bold text-white">{activeConfig?.label}</h3>
              </div>
              {renderContent(activeData)}
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Floating Dock ───────────────────────────────────────────────────────────

// Mounts a fixed, animated bottom navigation dock allowing quick switching between core dashboard workspace views.
function FloatingDock({ activeView, setActiveView, onLogout }) {
  const nav = [
    { id: "home", icon: LayoutDashboard, label: "Dashboard" },
    { id: "strategy", icon: Wand2, label: "AI Strategy" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "funding", icon: DollarSign, label: "Funding" },
    { id: "messages", icon: MessageSquare, label: "Messages" },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 25 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div
        className="flex items-center gap-1 px-3 py-3 rounded-2xl border border-white/10"
        style={{
          background: "rgba(10, 14, 23, 0.85)",
          backdropFilter: "blur(30px)",
          WebkitBackdropFilter: "blur(30px)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
        }}
      >
        {nav.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 group"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.9 }}
          >
            {activeView === item.id && (
              <motion.div
                layoutId="dock-active"
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-400/20"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <item.icon
              className={cn(
                "w-5 h-5 transition-colors duration-200 relative z-10",
                activeView === item.id ? "text-blue-400" : "text-white/40 group-hover:text-white/80"
              )}
            />
            <span
              className={cn(
                "text-[10px] font-medium transition-colors duration-200 relative z-10",
                activeView === item.id ? "text-blue-400" : "text-white/30 group-hover:text-white/60"
              )}
            >
              {item.label}
            </span>
          </motion.button>
        ))}

        <div className="w-px h-8 bg-white/10 mx-1" />

        <motion.button
          onClick={onLogout}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-white/40 hover:text-red-400 transition-colors group"
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.9 }}
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Logout</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Hero Input Area ──────────────────────────────────────────────────────────

// Renders the primary hero interface allowing founders to input their startup idea and trigger AI generation.
function HeroInputArea({ onGenerate, isGenerating }) {
  const [prompt, setPrompt] = useState("");

  const suggestions = [
    "AI-powered legal document assistant for SMBs",
    "On-demand mental health coaching platform",
    "Sustainable supply chain transparency tool",
    "Hyper-local community marketplace app",
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-400/20 bg-blue-400/5 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400 tracking-widest uppercase">StartupAI Intelligence</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
          Your Startup,{" "}
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(135deg, #60A5FA, #3B82F6)" }}
          >
            Reimagined
          </span>
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Describe your vision. Our AI builds a complete strategy in seconds.
        </p>
      </motion.div>

      {/* Main input */}
      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative"
      >
        <div
          className="relative rounded-2xl border border-white/10 overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 0 40px rgba(59,130,246,0.05), 0 25px 50px rgba(0,0,0,0.3)",
          }}
        >
          {/* Animated gradient top edge */}
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.4), rgba(37,99,235,0.4), rgba(59,130,246,0.4), transparent)",
            }}
          />

          <div className="p-6 space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your startup idea... (e.g. 'A marketplace that connects local farmers with urban restaurants using AI-powered logistics')"
              className="w-full bg-transparent text-white placeholder-white/25 resize-none outline-none text-base leading-relaxed min-h-[100px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey) onGenerate(prompt);
              }}
            />
            <div className="flex items-center justify-between">
              <p className="text-white/25 text-xs">Press ⌘+Enter to generate</p>
              <GradientButton
                onClick={() => onGenerate(prompt)}
                loading={isGenerating}
                icon={isGenerating ? undefined : Wand2}
                size="md"
              >
                {isGenerating ? "Generating..." : "Generate Strategy"}
              </GradientButton>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Suggestions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-wrap gap-2 justify-center"
      >
        <span className="text-white/30 text-xs mr-1 self-center">Try:</span>
        {suggestions.map((s, i) => (
          <motion.button
            key={i}
            onClick={() => setPrompt(s)}
            className="px-3 py-1.5 rounded-full text-xs text-white/50 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white/80 hover:border-white/20 transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
          >
            {s}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Generating State ─────────────────────────────────────────────────────────

// Displays an animated multi-step loading sequence indicating the active progress of AI strategy report generation.
function GeneratingState() {
  const steps = [
    "Analyzing market landscape...",
    "Modeling competitive dynamics...",
    "Structuring financial roadmap...",
    "Crafting growth strategies...",
    "Assessing risks & opportunities...",
    "Finalizing your strategy report...",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((p) => (p + 1) % steps.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-8 py-16"
    >
      <AIOrb isGenerating={true} />
      <div className="text-center space-y-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-white/70 text-base font-medium"
          >
            {steps[step]}
          </motion.p>
        </AnimatePresence>
        <p className="text-white/30 text-sm">This may take a few moments</p>
      </div>
      {/* Progress dots */}
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-blue-400"
            animate={{ opacity: i <= step ? 1 : 0.2, scale: i === step ? 1.4 : 1 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Dashboard Stats View ─────────────────────────────────────────────────────

// Renders the default workspace view displaying aggregate metrics, quick navigation actions, and recent live platform activity.
function DashboardView({ stats, report, onGenerateNew }) {
  const statCards = [
    { icon: Users, label: "Investors Reached", value: stats?.investors ?? "—", change: 12, color: "cyan" },
    { icon: MessageSquare, label: "Messages", value: stats?.messages ?? "—", change: 5, color: "magenta" },
    { icon: DollarSign, label: "Funding Goal", value: stats?.funding_goal ? `$${Number(stats.funding_goal).toLocaleString()}` : "—", color: "orange" },
    { icon: Activity, label: "Profile Score", value: stats?.verified ? "Verified ✓" : "Pending", color: "purple" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      >
        {statCards.map((c, i) => (
          <motion.div
            key={i}
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          >
            <StatCard {...c} />
          </motion.div>
        ))}
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Wand2, label: "AI Strategy", desc: "Generate a complete business plan", color: "from-blue-500/10 to-blue-600/10", border: "border-blue-400/20", text: "text-blue-400", onClick: onGenerateNew },
          { icon: Rocket, label: "Create Pitch", desc: "Build your investor pitch deck", color: "from-blue-500/10 to-blue-600/10", border: "border-blue-400/20", text: "text-blue-400", link: "/create-pitch" },
          { icon: Globe, label: "Marketplace", desc: "Connect with investors", color: "from-blue-500/10 to-blue-600/10", border: "border-blue-400/20", text: "text-blue-400", link: "/marketplace" },
        ].map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <GlassCard
              className={`p-5 bg-gradient-to-br ${action.color} border ${action.border}`}
              onClick={action.onClick || (() => action.link && (window.location.href = action.link))}
            >
              <div className="flex items-start justify-between mb-4">
                <action.icon className={cn("w-7 h-7", action.text)} />
                <ArrowUpRight className="w-4 h-4 text-white/30" />
              </div>
              <h3 className="text-white font-bold text-base mb-1">{action.label}</h3>
              <p className="text-white/50 text-xs">{action.desc}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Recent activity */}
      <GlassCard className="p-6" hover={false}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-base">Recent Activity</h3>
          <span className="text-white/40 text-xs">Live</span>
        </div>
        <div className="space-y-3">
          {[
            { icon: Star, text: "Investor viewed your profile", time: "2m ago", color: "text-yellow-400" },
            { icon: MessageSquare, text: "New message from Sequoia Capital", time: "1h ago", color: "text-cyan-400" },
            { icon: Check, text: "Profile verification completed", time: "3h ago", color: "text-emerald-400" },
            { icon: TrendingUp, text: "Strategy report generated", time: "1d ago", color: "text-purple-400" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
            >
              <div className={cn("w-7 h-7 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0", item.color)}>
                <item.icon className="w-3.5 h-3.5" />
              </div>
              <p className="text-white/60 text-sm flex-1">{item.text}</p>
              <span className="text-white/30 text-xs flex-shrink-0">{item.time}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

// ─── Strategy View ────────────────────────────────────────────────────────────

// Displays the dedicated strategy workspace where founders interact with the AI to formulate business plans.
function StrategyView({ onGenerate, isGenerating, report }) {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <HeroInputArea onGenerate={onGenerate} isGenerating={isGenerating} />
      </motion.div>

      {!isGenerating && !report && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-4 py-8"
        >
          <AIOrb isGenerating={false} />
          <p className="text-white/30 text-sm">Ready to analyze your startup idea</p>
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

// Serves as the primary authenticated workspace for founders, integrating AI tools, analytics, funding, and messaging modules.
export default function NewStartupDashboard() {
  const [activeView, setActiveView] = useState("home");
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [stats, setStats] = useState({});
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    const loadStats = async () => {
      try {
        const res = await API.get("dashboard-stats/");
        setStats(res.data);
      } catch (err) {
        console.error("Stats error:", err);
      }
    };
    loadStats();
  }, []);

  const handleGenerate = useCallback(async (prompt) => {
    setIsGenerating(true);
    setActiveView("strategy");
    try {
      const res = await API.post("generate-analysis/", prompt ? { context: prompt } : {});
      setReport(res.data.data || res.data);
      setShowReport(true);
    } catch (err) {
      console.error("Generate error:", err);
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to generate. Try again.");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleLogout = () => {
    session.clear();
    navigate("/login");
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Background */}
      <GradientMesh />

      {/* Top bar */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 25 }}
        className="fixed top-0 left-0 right-0 z-40 px-6 py-4"
      >
        <div
          className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3 rounded-2xl border border-white/10"
          style={{
            background: "rgba(8, 4, 25, 0.75)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
                <span className="font-black text-white text-base tracking-tight">Startup</span>
              <span
                className="font-black text-base"
                style={{ backgroundImage: "linear-gradient(135deg, #60A5FA, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
              >AI</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/startup-dashboard")}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main scroll area */}
      <main className="relative z-10 min-h-screen pt-24 pb-32 px-4">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div key="generating">
                <GeneratingState />
              </motion.div>
            ) : activeView === "home" ? (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DashboardView
                  stats={stats}
                  report={report}
                  onGenerateNew={() => setActiveView("strategy")}
                />
              </motion.div>
            ) : activeView === "strategy" ? (
              <motion.div
                key="strategy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <StrategyView
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                  report={report}
                />
              </motion.div>
            ) : (
              <motion.div
                key="other"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
              >
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                  {activeView === "analytics" && <BarChart3 className="w-9 h-9 text-cyan-400" />}
                  {activeView === "funding" && <DollarSign className="w-9 h-9 text-orange-400" />}
                  {activeView === "messages" && <MessageSquare className="w-9 h-9 text-pink-400" />}
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2 capitalize">{activeView}</h2>
                  <p className="text-white/40">This section is loading its new experience...</p>
                </div>
                <GradientButton onClick={() => navigate(`/${activeView}`)} icon={ArrowUpRight}>
                  Open Full {activeView}
                </GradientButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Dock */}
      <FloatingDock activeView={activeView} setActiveView={setActiveView} onLogout={handleLogout} />

      {/* Strategy Report Modal */}
      <AnimatePresence>
        {showReport && report && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60"
              style={{ backdropFilter: "blur(4px)" }}
              onClick={() => setShowReport(false)}
            />
            <StartupIdeaCard idea={report} onClose={() => setShowReport(false)} />
          </>
        )}
      </AnimatePresence>

      {/* Show report button if report exists but modal is closed */}
      <AnimatePresence>
        {report && !showReport && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 right-6 z-40"
          >
            <GradientButton onClick={() => setShowReport(true)} icon={Sparkles} size="sm">
              View Strategy Report
            </GradientButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
