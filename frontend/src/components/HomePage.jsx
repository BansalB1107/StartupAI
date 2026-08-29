import React, { useEffect, useState, useRef } from "react";
import Advanced3DHero from "./Advanced3DHero";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ChevronDown, ArrowRight, Sparkles, BrainCircuit, Rocket,
  TrendingUp, Users, DollarSign, BarChart3, Target, Shield,
  FileText, Zap, Globe, CheckCircle, Star, Play,
  Menu, X, MessageSquare, PieChart, Activity, Crown,
  Building2, Search, BadgeCheck, ChevronRight
} from "lucide-react";

// ─── Brand constants ─────────────────────────────────────────────────────────
const BRAND = "StartupAI";
const GRAD = "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)";
const GRAD_R = "linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)";

// ─── Navbar ──────────────────────────────────────────────────────────────────
// Primary navigation bar supporting responsive mobile menus, dropdowns, and unauthenticated state routing.
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Product", items: ["AI Strategy Engine", "Investor Marketplace", "Pitch Builder", "Analytics Dashboard", "PDF Reports"] },
    { label: "For Whom", items: ["Early-stage Startups", "Series A+", "Angel Investors", "VCs & Funds"] },
    { label: "Resources", items: ["Documentation", "Success Stories", "Blog", "Community Forum"] },
  ];

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(5,5,20,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
        boxShadow: scrolled ? "0 1px 0 rgba(255,255,255,0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-[68px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 select-none flex-shrink-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: GRAD, boxShadow: "0 4px 12px rgba(59,130,246,0.35)" }}
          >
            <BrainCircuit className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
          </div>
          <span className="text-xl font-black tracking-tight" style={{ color: "#f8fafc" }}>
            Startup<span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>AI</span>
          </span>
        </Link>

        {/* Centre links */}
        <div className="hidden lg:flex items-center gap-0.5">
          {links.map((l) => (
            <div key={l.label} className="relative" onMouseEnter={() => setOpenDrop(l.label)} onMouseLeave={() => setOpenDrop(null)}>
              <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{ color: "rgba(255,255,255,0.7)" }}>
                {l.label}
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
              <AnimatePresence>
                {openDrop === l.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1.5 w-52 bg-[#121826] rounded-2xl shadow-xl border border-[#1E293B] overflow-hidden py-2"
                  >
                    {l.items.map((item) => (
                      <a key={item} href="#" className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#3B82F6] transition-colors">
                        <ChevronRight className="w-3 h-3 opacity-30" />
                        {item}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Right */}
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold transition-colors tracking-wide px-2" style={{ color: "rgba(255,255,255,0.65)" }}>
            SIGN IN
          </Link>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="text-sm font-bold text-white px-5 py-2.5 rounded-xl"
              style={{ background: GRAD, boxShadow: "0 4px 16px rgba(59,130,246,0.3)" }}
            >
              Get Started Free
            </motion.button>
          </Link>
        </div>

        {/* Mobile burger */}
        <button className="lg:hidden p-2 rounded-lg text-[#4B5563] hover:bg-black/5" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-[#121826] border-t border-[#1E293B] overflow-hidden"
          >
            <div className="px-6 py-4 space-y-1">
              {links.map((l) => <button key={l.label} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#94A3B8] hover:bg-[#1E293B]">{l.label}</button>)}
              <div className="pt-3 border-t border-[#1E293B] space-y-2">
                <Link to="/login" className="block px-3 py-2.5 text-sm font-semibold text-[#4B5563]">SIGN IN</Link>
                <Link to="/register" className="block px-3 py-2.5 text-sm font-bold text-white text-center rounded-xl" style={{ background: GRAD }}>Get Started Free</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ─── Animated number counter ─────────────────────────────────────────────────
// Animated number counter triggering sequential increments when scrolled into the viewport.
function Counter({ to, suffix = "", prefix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = to / 60;
    const t = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(t); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [started, to]);

  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
// Dynamic landing page hero section incorporating 3D particle animations and primary call-to-actions.
function HeroSection() {
  const words = ["Strategy", "Funding", "Growth", "Investors", "Success"];
  const [wIdx, setWIdx] = useState(0);
  const [phase, setPhase] = useState(0); // 0 = Wave, 1 = Explode, 2 = Assemble

  useEffect(() => {
    const t = setInterval(() => setWIdx((p) => (p + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, []);

  const handlePhaseAdvance = () => {
    if (phase === 0) {
      setPhase(1); // Explode
      setTimeout(() => {
        setPhase(2); // Auto-assemble after explosion
      }, 2500); // 2.5s explosion duration
    } else if (phase === 2) {
      setPhase(0); // Reset to wave for demo purposes
    }
  };

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden"
      style={{ background: "transparent" }}
    >
      {/* ── Advanced 3D Hero ── */}
      <Advanced3DHero phase={phase} />

      {/* ── Subtle grid overlay ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.025 }}>
          <defs>
            <pattern id="hero-grid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      {/* ── Bottom vignette fade ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(10,10,26,0.95))",
          zIndex: 3,
        }}
      />

      {/* ── Hero content ── */}
      <div className="relative w-full max-w-6xl mx-auto text-center" style={{ zIndex: 10 }}>
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-7">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
            style={{
              border: "1px solid rgba(59,130,246,0.4)",
              background: "rgba(59,130,246,0.12)",
              color: "#93c5fd",
              backdropFilter: "blur(12px)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Startup Intelligence Platform
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-5xl md:text-6xl xl:text-7xl font-black leading-[1.06] tracking-tight mb-5"
          style={{ color: "#f8fafc", fontFamily: "'Inter', sans-serif" }}
        >
          YOUR AI CO-PILOT
          <br />
          FOR STARTUP{" "}
          <span className="relative inline-block">
            <AnimatePresence mode="wait">
              <motion.span
                key={wIdx}
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                transition={{ duration: 0.35 }}
                className="inline-block"
                style={{
                  backgroundImage: GRAD,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {words[wIdx]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ fontFamily: "'Inter', sans-serif", color: "rgba(255,255,255,0.55)" }}
        >
          Generate market analysis, SWOT reports, financial roadmaps &amp; growth strategies in seconds.
          Connect directly with investors. Raise smarter.
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <motion.button
            onClick={handlePhaseAdvance}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white text-base relative overflow-hidden group"
            style={{ background: GRAD, boxShadow: "0 10px 40px rgba(59,130,246,0.45)", fontFamily: "'Inter', sans-serif" }}
          >
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.18) 50%,transparent 60%)" }}
            />
            <Rocket className="w-5 h-5" />
            {phase === 0 ? "Launch Dashboard" : phase === 1 ? "Assembling..." : "Reset Animation"}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl font-semibold transition-all"
            style={{
              color: "rgba(255,255,255,0.75)",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Play className="w-4 h-4 fill-current" />
            Watch 2-min demo
          </motion.button>
        </motion.div>

        {/* Stat chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-8"
        >
          {[
            { label: "Startups Launched", to: 3400, suffix: "+" },
            { label: "Investors on Platform", to: 850, suffix: "+" },
            { label: "Avg. Funding Raised", to: 240, suffix: "K+", prefix: "$" },
            { label: "AI Reports Generated", to: 18000, suffix: "+" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="text-2xl font-black"
                style={{ fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}
              >
                <Counter to={s.to} suffix={s.suffix} prefix={s.prefix || ""} />
              </div>
              <div
                className="text-[11px] font-semibold mt-0.5 tracking-wide"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center mt-14"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── AI Dashboard Mockup visual ───────────────────────────────────────────────
// Interactive browser mockup visually demonstrating core dashboard functionality and startup strategy tools.
function AIDashboardMockup() {
  const [activeTab, setActiveTab] = useState("strategy");

  const tabs = [
    { id: "strategy", label: "AI Strategy", icon: BrainCircuit },
    { id: "investors", label: "Investors", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: "transparent",
        boxShadow: "0 40px 100px -20px rgba(59,130,246,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
      }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-5 py-3.5 bg-[#121826] border-b border-[#1E293B]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <div className="w-3 h-3 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 h-6 bg-gray-100 rounded-md mx-6 flex items-center px-3">
          <span className="text-[10px] text-gray-400">app.startupai.io/dashboard</span>
        </div>
      </div>

      <div className="flex" style={{ minHeight: "440px" }}>
        {/* Sidebar */}
        <div className="w-52 bg-[#121826] border-r border-[#1E293B] flex flex-col py-5 px-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-2 mb-6">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: GRAD }}>
              <BrainCircuit className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-black text-[#F8FAFC]">StartupAI</span>
          </div>
          {[
            { icon: BarChart3, label: "Dashboard", active: false },
            { icon: BrainCircuit, label: "AI Strategy", active: activeTab === "strategy" },
            { icon: Users, label: "Investors", active: activeTab === "investors" },
            { icon: DollarSign, label: "Funding", active: false },
            { icon: FileText, label: "Reports", active: false },
            { icon: MessageSquare, label: "Messages", active: false },
          ].map((item) => (
            <button
              key={item.label}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-0.5 text-[12px] font-semibold text-left transition-all ${item.active
                ? "text-white"
                : "text-[#64748B] hover:bg-[#1E293B] hover:text-[#F8FAFC]"
                }`}
              style={item.active ? { background: GRAD } : {}}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-5 overflow-hidden">
          {/* Tab bar */}
          <div className="flex gap-2 mb-5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === t.id ? "text-white shadow-sm" : "text-[#64748B] bg-[#121826] hover:bg-[#1E293B]"
                  }`}
                style={activeTab === t.id ? { background: GRAD } : {}}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "strategy" && (
              <motion.div key="strategy" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <StrategyTab />
              </motion.div>
            )}
            {activeTab === "investors" && (
              <motion.div key="investors" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <InvestorsTab />
              </motion.div>
            )}
            {activeTab === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <AnalyticsTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Renders a mock strategy dashboard tab displaying generated business insights and AI analysis.
function StrategyTab() {
  const sections = [
    { label: "Market Analysis", icon: BarChart3, color: "rgba(59,130,246,0.15)", iconColor: "#3B82F6", content: "TAM: $4.2B · SAM: $820M · SOM: $68M. High-growth sector with 34% YoY expansion." },
    { label: "SWOT Analysis", icon: Shield, color: "#DBEAFE", iconColor: "#1D4ED8", content: "Strengths: First-mover AI advantage. Weaknesses: Early-stage brand awareness. Opportunities: Underserved SMB market." },
    { label: "Financial Roadmap", icon: DollarSign, color: "#D1FAE5", iconColor: "#065F46", content: "Break-even at Month 14. Projected ARR $1.2M by Year 2. Seed round: $500K recommended." },
    { label: "Growth Strategy", icon: TrendingUp, color: "rgba(59,130,246,0.15)", iconColor: "#3B82F6", content: "Product-led growth via freemium. Viral loop through investor referrals. Content marketing + SEO." },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-2.5">
      <motion.div variants={item} className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#F8FAFC]">AI Strategy Report — Q3 2025</h3>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white" style={{ background: "linear-gradient(135deg, #1E40AF, #3B82F6)" }}>
          ✦ AI Generated
        </span>
      </motion.div>
      {sections.map((s) => (
        <motion.div key={s.label} variants={item} whileHover={{ scale: 1.02 }} className="bg-[#121826] rounded-xl p-3.5 border border-[#1E293B] shadow-[0_2px_10px_rgba(0,0,0,0.02)] cursor-pointer">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.color }}>
              <s.icon className="w-3.5 h-3.5" style={{ color: s.iconColor }} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#F8FAFC] mb-0.5">{s.label}</p>
              <p className="text-[10px] text-[#64748B] leading-relaxed">{s.content}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Renders a mock investor marketplace tab demonstrating connection tools and funding stage filtering.
function InvestorsTab() {
  const investors = [
    { name: "Arjun Mehta", fund: "Sequoia Surge", stage: "Seed", amount: "$250K", avatar: "AM", bg: "#1D4ED8", status: "Connected" },
    { name: "Priya Sharma", fund: "Accel India", stage: "Pre-A", amount: "$500K", avatar: "PS", bg: "#3B82F6", status: "Pending" },
    { name: "Vikram Bose", fund: "Blume Ventures", stage: "Seed", amount: "$150K", avatar: "VB", bg: "#3b82f6", status: "New" },
    { name: "Ananya Kapoor", fund: "Matrix Partners", stage: "Series A", amount: "$2M", avatar: "AK", bg: "#f59e0b", status: "New" },
  ];
  const statusColors = { Connected: "#D1FAE5", Pending: "rgba(245,158,11,0.15)", New: "rgba(59,130,246,0.15)" };
  const statusText = { Connected: "#065F46", Pending: "#F59E0B", New: "#3B82F6" };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-7 bg-[#121826] rounded-lg border border-gray-200 flex items-center px-2.5 gap-1.5">
          <Search className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400">Search investors by stage, sector...</span>
        </div>
        <button className="h-7 px-3 rounded-lg text-[10px] font-bold text-white" style={{ background: GRAD }}>Filter</button>
      </div>
      <div className="space-y-2">
        {investors.map((inv) => (
          <div key={inv.name} className="bg-[#121826] rounded-xl px-3.5 py-2.5 border border-[#1E293B] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: inv.bg }}>{inv.avatar}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-[#F8FAFC] truncate">{inv.name}</p>
              <p className="text-[10px] text-[#64748B] truncate">{inv.fund} · {inv.stage}</p>
            </div>
            <span className="text-[10px] font-bold text-[#3B82F6]">{inv.amount}</span>
            <span className="text-[9px] font-bold px-2 py-1 rounded-full" style={{ background: statusColors[inv.status], color: statusText[inv.status] }}>{inv.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Renders a mock analytics dashboard tab displaying sample profile views and engagement metrics.
function AnalyticsTab() {
  const bars = [65, 82, 71, 90, 78, 95, 88];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Profile Views", value: "1,247", change: "+18%", up: true },
          { label: "Investor Reach", value: "84", change: "+5", up: true },
          { label: "Funding Score", value: "87/100", change: "↑ 4", up: true },
        ].map((s) => (
          <div key={s.label} className="bg-[#121826] rounded-xl p-3 border border-[#1E293B]">
            <p className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-sm font-black text-[#F8FAFC]">{s.value}</p>
            <p className="text-[9px] font-bold text-emerald-600 mt-0.5">{s.change}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#121826] rounded-xl p-3.5 border border-[#1E293B]">
        <p className="text-[10px] font-bold text-[#64748B] mb-3 uppercase tracking-wide">Weekly Investor Engagements</p>
        <div className="flex items-end gap-1.5 h-20">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
                className="w-full rounded-t-md"
                style={{ background: i === 5 ? GRAD : "#1E293B", minHeight: "4px" }}
              />
              <span className="text-[8px] text-[#9CA3AF] font-medium">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
// Displays a step-by-step sequential grid outlining the core user journey from idea to funding.
function HowItWorks() {
  const steps = [
    { num: "01", icon: Rocket, title: "Create Your Startup Profile", desc: "Fill in your idea, industry, and funding goal. Our AI immediately begins understanding your market context." },
    { num: "02", icon: BrainCircuit, title: "Generate Your AI Strategy Report", desc: "One click produces a full business plan — market analysis, SWOT, financial roadmap, competition analysis, and 6 more sections." },
    { num: "03", icon: Users, title: "Connect With Matched Investors", desc: "Browse our investor marketplace, send connection requests, and chat directly with VCs and angels who match your stage and sector." },
    { num: "04", icon: DollarSign, title: "Track Funding & Close Rounds", desc: "Monitor your funding progress, manage investor relations, and get AI recommendations to improve your fundability score." },
  ];

  return (
    <section className="py-28 px-6 bg-[#121826] relative">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, #E5E7EB, transparent)" }} />
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full text-[#3B82F6] bg-purple-50">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[#F8FAFC] mb-4" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
            FROM IDEA TO{" "}
            <span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              FUNDED
            </span>
            {" "}IN 4 STEPS
          </h2>
          <p className="text-[#64748B] text-lg max-w-xl mx-auto">No MBA required. No consultants. Just AI.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="relative bg-[#121826] rounded-2xl p-6 border border-[#1E293B] shadow-sm hover:shadow-xl transition-all cursor-default group"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-6 h-px bg-gray-200 z-10" />
              )}
              <div className="text-5xl font-black mb-4 select-none" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", opacity: 0.25 }}>
                {s.num}
              </div>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.15))" }}>
                <s.icon className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-sm font-bold text-[#F8FAFC] mb-2">{s.title}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features Grid ────────────────────────────────────────────────────────────
// Comprehensive grid highlighting all major platform features, modules, and premium tier capabilities.
function FeaturesSection() {
  const features = [
    {
      icon: BrainCircuit, color: "rgba(59,130,246,0.15)", iconColor: "#3B82F6",
      title: "10-Section AI Strategy Engine",
      desc: "Market analysis, SWOT, financial roadmap, growth strategy, target audience, revenue model, competition analysis, marketing tactics, operations plan, and risk assessment — all generated in one click.",
      badge: "Core Feature",
    },
    {
      icon: Users, color: "#DBEAFE", iconColor: "#1D4ED8",
      title: "Live Investor Marketplace",
      desc: "Browse 850+ verified investors filtered by stage, sector, and ticket size. Send connection requests and manage relationships in one place.",
      badge: "Investor Access",
    },
    {
      icon: FileText, color: "#D1FAE5", iconColor: "#065F46",
      title: "PDF Reports & Email Export",
      desc: "Download your AI strategy reports as beautiful PDFs or send them directly to investors' inboxes from within the platform.",
      badge: "Premium",
    },
    {
      icon: DollarSign, color: "rgba(245,158,11,0.15)", iconColor: "#F59E0B",
      title: "Funding Progress Tracker",
      desc: "Track every investment transaction, monitor your funding runway, and visualize your path to closing your seed or Series A round.",
      badge: "Finance",
    },
    {
      icon: BarChart3, color: "rgba(59,130,246,0.15)", iconColor: "#3B82F6",
      title: "Startup Analytics Dashboard",
      desc: "Real-time metrics on profile views, investor engagements, message response rates, and your overall fundability score.",
      badge: "Analytics",
    },
    {
      icon: MessageSquare, color: "#E0F2FE", iconColor: "#0369A1",
      title: "Secure Investor Chat",
      desc: "End-to-end messaging with investors directly on the platform. No need to share email addresses until you're ready.",
      badge: "Communication",
    },
    {
      icon: Crown, color: "rgba(30,41,59,0.5)", iconColor: "#3B82F6",
      title: "Premium AI Upgrades",
      desc: "Unlock advanced AI models, unlimited report generation, priority investor matching, and white-label pitch decks.",
      badge: "Premium",
    },
    {
      icon: Shield, color: "#ECFDF5", iconColor: "#065F46",
      title: "Verified Founder Badges",
      desc: "Complete our verification process to get a Verified Founder badge that increases investor trust and response rates by 3×.",
      badge: "Trust",
    },
  ];

  return (
    <section className="py-28 px-6 relative" style={{ background: "transparent" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full text-[#3B82F6] bg-purple-50">Everything Included</span>
          <h2 className="text-4xl md:text-5xl font-black text-[#F8FAFC] mb-4" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
            EVERY TOOL YOUR STARTUP
            <br />
            <span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              WILL EVER NEED
            </span>
          </h2>
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
            We built the platform we wish existed when we were raising our first round.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -5 }}
              className="bg-[#121826] rounded-2xl p-5 border border-[#1E293B] shadow-sm hover:shadow-lg transition-all cursor-default group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: f.color }}>
                  <f.icon className="w-5 h-5" style={{ color: f.iconColor }} />
                </div>
                <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{f.badge}</span>
              </div>
              <h3 className="text-sm font-bold text-[#F8FAFC] mb-2 leading-snug">{f.title}</h3>
              <p className="text-[12px] text-[#64748B] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Social Proof / Testimonials ──────────────────────────────────────────────
// Renders social proof cards and positive founder reviews to build trust with new users.
function TestimonialsSection() {
  const testimonials = [
    {
      quote: "StartupAI generated our complete investor pitch strategy in under 3 minutes. We closed our seed round 2 months later.",
      name: "Riya Desai", role: "Co-founder, NutriAI", avatar: "RD", bg: "#1D4ED8",
      stars: 5,
    },
    {
      quote: "The investor marketplace is incredible. I had conversations with 12 VCs in my first week. Never would have had that access otherwise.",
      name: "Karan Malhotra", role: "Founder, FinStack", avatar: "KM", bg: "#1D4ED8",
      stars: 5,
    },
    {
      quote: "The AI reports are genuinely insightful. The SWOT and competition analysis sections saved us weeks of research.",
      stars: 5,
    },
  ];

  return (
    <section className="py-28 px-6 bg-[#121826] relative">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, #E5E7EB, transparent)" }} />
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full text-[#3B82F6] bg-purple-50">Founder Stories</span>
          <h2 className="text-4xl font-black text-[#F8FAFC]" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
            TRUSTED BY FOUNDERS
            <br />
            <span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              WHO RAISED MILLIONS
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-[#121826] rounded-2xl p-7 border border-[#1E293B] shadow-sm hover:shadow-xl transition-all"
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.stars }).map((_, si) => (
                  <Star key={si} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-[13px] text-[#94A3B8] leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: t.bg }}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#F8FAFC]">{t.name}</p>
                  <p className="text-[11px] text-[#64748B]">{t.role}</p>
                </div>
                <BadgeCheck className="w-5 h-5 text-purple-500 ml-auto" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── For Both Roles ───────────────────────────────────────────────────────────
function DualRoleSection() {
  return (
    <section className="py-28 px-6 relative" style={{ background: "transparent" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-black text-[#F8FAFC]" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
            BUILT FOR BOTH SIDES
            <br />
            <span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              OF THE TABLE
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* For Startups */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="relative rounded-3xl p-8 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1E293B 0%, rgba(30,41,59,0.5) 100%)",
              border: "1px solid rgba(59,130,246,0.12)",
            }}
          >
            <div className="absolute top-6 right-6 opacity-10">
              <Rocket className="w-24 h-24 text-purple-600" />
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: GRAD }}>
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-black text-[#F8FAFC] mb-3">For Founders</h3>
            <p className="text-[#64748B] text-sm mb-6 leading-relaxed">
              Turn your idea into a fundable business. Get AI strategy, connect with the right investors, and track your journey to closing.
            </p>
            <ul className="space-y-2.5 mb-7">
              {["AI-generated strategy reports", "Investor connection requests", "Funding progress tracker", "Pitch builder & deck creator", "Analytics & fundability score"].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
                  <CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/register">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm"
                style={{ background: GRAD, boxShadow: "0 6px 20px rgba(59,130,246,0.3)" }}
              >
                Start as a Founder <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>

          {/* For Investors */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="relative rounded-3xl p-8 overflow-hidden"
            style={{
              background: "transparent",
              border: "1px solid rgba(59,130,246,0.12)",
            }}
          >
            <div className="absolute top-6 right-6 opacity-10">
              <Building2 className="w-24 h-24 text-blue-600" />
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-blue-600">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-black text-[#F8FAFC] mb-3">For Investors</h3>
            <p className="text-[#64748B] text-sm mb-6 leading-relaxed">
              Discover pre-screened startups, review AI-verified business plans, invest directly, and manage your entire portfolio in one dashboard.
            </p>
            <ul className="space-y-2.5 mb-7">
              {["Access 3,400+ curated startups", "AI-screened deal flow", "Direct investment & wallet system", "Portfolio analytics dashboard", "Secure founder messaging"].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-[#94A3B8]">
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/register">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Join as an Investor <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-24 px-6 bg-[#121826]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl px-10 py-20 text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 60%, #0F3460 100%)",
            boxShadow: "0 50px 100px -20px rgba(0,0,0,0.3)",
          }}
        >
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.03]">
            <svg className="w-full h-full"><defs><pattern id="grid2" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern></defs><rect width="100%" height="100%" fill="url(#grid2)" /></svg>
          </div>
          {/* Glows */}
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(#1D4ED8, transparent)", filter: "blur(40px)" }} />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-20" style={{ background: "radial-gradient(#3B82F6, transparent)", filter: "blur(40px)" }} />

          <div className="relative z-10">
            <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-[#121826]/5 text-white/70 text-xs font-semibold mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" /> Free to start · No credit card required
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-5" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.03em" }}>
              YOUR STARTUP JOURNEY
              <br />
              <span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                STARTS HERE.
              </span>
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-lg mx-auto">
              Join 3,400+ founders who used StartupAI to build smarter, raise faster, and grow further.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-white text-base"
                  style={{ background: GRAD, boxShadow: "0 10px 40px rgba(59,130,246,0.4)", fontFamily: "'Inter', sans-serif" }}
                >
                  <Rocket className="w-5 h-5" /> Get Started Free
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button whileHover={{ scale: 1.02 }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white/80 border border-white/15 hover:border-white/30 transition-colors"
                >
                  Sign In <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { title: "Product", links: ["AI Strategy Engine", "Investor Marketplace", "Pitch Builder", "Analytics", "PDF Reports"] },
    { title: "For", links: ["Early-stage Startups", "Series A Founders", "Angel Investors", "VC Funds", "Accelerators"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
    { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Security", "Cookie Policy"] },
  ];

  return (
    <footer className="bg-[#121826] border-t border-[#1E293B] pt-16 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          {/* Brand col */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: GRAD }}>
                <BrainCircuit className="w-[18px] h-[18px] text-white" />
              </div>
              <span className="text-lg font-black text-[#F8FAFC]">
                Startup<span style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>AI</span>
              </span>
            </div>
            <p className="text-[12px] text-[#9CA3AF] leading-relaxed">
              The AI co-pilot for ambitious founders. Build, raise, and grow — smarter.
            </p>
          </div>

          {/* Link cols */}
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-bold text-[#F8FAFC] uppercase tracking-[0.12em] mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-[12px] text-[#64748B] hover:text-[#F8FAFC] transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[#1E293B]">
          <p className="text-[12px] text-[#9CA3AF]">© 2025 StartupAI Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Home Page ───────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div style={{ background: "transparent", fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif", color: "#F8FAFC" }}>
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <TestimonialsSection />
      <DualRoleSection />
      <CTASection />
      <Footer />
    </div>
  );
}
