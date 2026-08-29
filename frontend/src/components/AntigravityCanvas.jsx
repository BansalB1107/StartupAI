import React, { useEffect, useRef, useState } from "react";

// ─── Floating object definitions ──────────────────────────────────────────────
const OBJECTS = [
  // Large glassmorphism orbs
  {
    id: "orb-0", type: "orb",
    x: 18, y: 25, z: 0,
    size: 120,
    color: "radial-gradient(circle at 35% 35%, #1E3A8A, #1D4ED8 55%, #0F172A)",
    glowColor: "rgba(139,92,246,0.55)",
    phase: 0, speedX: 0.7, speedY: 0.5, speedZ: 0.4,
    ampX: 28, ampY: 22, ampZ: 12,
    rotX: 0.3, rotY: 0.5, rotZ: 0.2,
    mass: 2.5, baseOpacity: 0.92, baseBlur: 0,
  },
  {
    id: "orb-1", type: "orb",
    x: 72, y: 18, z: -30,
    size: 90,
    color: "radial-gradient(circle at 40% 30%, #3B82F6, #1E40AF 50%, #0F172A)",
    glowColor: "rgba(236,72,153,0.45)",
    phase: 1.2, speedX: 0.6, speedY: 0.8, speedZ: 0.3,
    ampX: 22, ampY: 30, ampZ: 14,
    rotX: 0.2, rotY: 0.4, rotZ: 0.35,
    mass: 2.0, baseOpacity: 0.88, baseBlur: 2,
  },
  {
    id: "orb-2", type: "orb",
    x: 85, y: 60, z: -20,
    size: 70,
    color: "radial-gradient(circle at 40% 30%, #bfdbfe, #3b82f6 50%, #1e3a8a)",
    glowColor: "rgba(59,130,246,0.4)",
    phase: 2.4, speedX: 0.9, speedY: 0.55, speedZ: 0.5,
    ampX: 18, ampY: 25, ampZ: 10,
    rotX: 0.4, rotY: 0.3, rotZ: 0.25,
    mass: 1.8, baseOpacity: 0.82, baseBlur: 3,
  },
  {
    id: "orb-3", type: "orb",
    x: 12, y: 65, z: -40,
    size: 55,
    color: "radial-gradient(circle at 40% 30%, #d9f99d, #22c55e 50%, #14532d)",
    glowColor: "rgba(34,197,94,0.35)",
    phase: 3.5, speedX: 1.1, speedY: 0.65, speedZ: 0.6,
    ampX: 14, ampY: 18, ampZ: 8,
    rotX: 0.5, rotY: 0.6, rotZ: 0.15,
    mass: 1.4, baseOpacity: 0.75, baseBlur: 5,
  },
  {
    id: "orb-4", type: "orb",
    x: 55, y: 80, z: -50,
    size: 45,
    color: "radial-gradient(circle at 40% 30%, #fde68a, #f59e0b 50%, #78350f)",
    glowColor: "rgba(245,158,11,0.3)",
    phase: 4.8, speedX: 0.8, speedY: 1.0, speedZ: 0.45,
    ampX: 10, ampY: 14, ampZ: 6,
    rotX: 0.6, rotY: 0.2, rotZ: 0.4,
    mass: 1.2, baseOpacity: 0.65, baseBlur: 7,
  },
  {
    id: "orb-5", type: "orb",
    x: 40, y: 15, z: -60,
    size: 35,
    color: "radial-gradient(circle at 40% 30%, #f5d0fe, #a855f7 50%, #581c87)",
    glowColor: "rgba(168,85,247,0.25)",
    phase: 5.7, speedX: 1.3, speedY: 0.75, speedZ: 0.7,
    ampX: 8, ampY: 12, ampZ: 5,
    rotX: 0.35, rotY: 0.55, rotZ: 0.5,
    mass: 1.0, baseOpacity: 0.55, baseBlur: 9,
  },

  // Glassmorphism UI Cards
  {
    id: "card-0", type: "card",
    x: 62, y: 28, z: 10,
    width: 200, height: 110,
    phase: 0.8, speedX: 0.55, speedY: 0.7, speedZ: 0.35,
    ampX: 20, ampY: 16, ampZ: 8,
    rotX: 0.15, rotY: 0.25, rotZ: 0.08,
    mass: 1.6, baseOpacity: 0.9, baseBlur: 0,
    content: "card-stats",
  },
  {
    id: "card-1", type: "card",
    x: 8, y: 42, z: 5,
    width: 180, height: 90,
    phase: 2.1, speedX: 0.75, speedY: 0.6, speedZ: 0.4,
    ampX: 16, ampY: 20, ampZ: 7,
    rotX: 0.2, rotY: 0.18, rotZ: 0.1,
    mass: 1.5, baseOpacity: 0.85, baseBlur: 1,
    content: "card-score",
  },
  {
    id: "card-2", type: "card",
    x: 70, y: 72, z: -10,
    width: 160, height: 80,
    phase: 3.9, speedX: 0.65, speedY: 0.85, speedZ: 0.3,
    ampX: 12, ampY: 15, ampZ: 6,
    rotX: 0.12, rotY: 0.22, rotZ: 0.07,
    mass: 1.3, baseOpacity: 0.78, baseBlur: 2,
    content: "card-metric",
  },

  // Geometric shapes
  {
    id: "geo-0", type: "geo",
    x: 30, y: 55, z: 15,
    size: 50, shape: "triangle",
    color: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
    glowColor: "rgba(139,92,246,0.4)",
    phase: 1.5, speedX: 0.9, speedY: 1.1, speedZ: 0.5,
    ampX: 18, ampY: 22, ampZ: 10,
    rotX: 1.2, rotY: 0.8, rotZ: 1.5,
    mass: 0.8, baseOpacity: 0.7, baseBlur: 0,
  },
  {
    id: "geo-1", type: "geo",
    x: 88, y: 38, z: -15,
    size: 40, shape: "diamond",
    color: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    glowColor: "rgba(6,182,212,0.35)",
    phase: 2.8, speedX: 1.0, speedY: 0.7, speedZ: 0.6,
    ampX: 14, ampY: 18, ampZ: 8,
    rotX: 0.9, rotY: 1.3, rotZ: 0.7,
    mass: 0.7, baseOpacity: 0.6, baseBlur: 2,
  },
  {
    id: "geo-2", type: "geo",
    x: 48, y: 88, z: -25,
    size: 35, shape: "hexagon",
    color: "linear-gradient(135deg, #f59e0b, #ef4444)",
    glowColor: "rgba(245,158,11,0.3)",
    phase: 4.2, speedX: 0.8, speedY: 0.9, speedZ: 0.4,
    ampX: 10, ampY: 13, ampZ: 6,
    rotX: 0.7, rotY: 1.0, rotZ: 1.1,
    mass: 0.65, baseOpacity: 0.55, baseBlur: 4,
  },
  {
    id: "geo-3", type: "geo",
    x: 20, y: 80, z: -35,
    size: 28, shape: "circle-ring",
    color: "transparent",
    border: "2px solid rgba(139,92,246,0.6)",
    glowColor: "rgba(139,92,246,0.2)",
    phase: 5.3, speedX: 1.2, speedY: 0.8, speedZ: 0.55,
    ampX: 8, ampY: 11, ampZ: 5,
    rotX: 1.5, rotY: 1.8, rotZ: 0.9,
    mass: 0.5, baseOpacity: 0.45, baseBlur: 6,
  },
  {
    id: "geo-4", type: "geo",
    x: 92, y: 82, z: -45,
    size: 22, shape: "circle-ring",
    color: "transparent",
    border: "2px solid rgba(236,72,153,0.5)",
    glowColor: "rgba(236,72,153,0.15)",
    phase: 6.1, speedX: 0.7, speedY: 1.3, speedZ: 0.65,
    ampX: 7, ampY: 9, ampZ: 4,
    rotX: 1.1, rotY: 0.6, rotZ: 1.4,
    mass: 0.4, baseOpacity: 0.4, baseBlur: 8,
  },

  // Micro-particles
  ...Array.from({ length: 18 }, (_, i) => ({
    id: `particle-${i}`,
    type: "particle",
    x: 5 + (i * 5.5) % 90,
    y: 5 + (i * 7.3) % 90,
    z: -60 - (i * 3) % 40,
    size: 4 + (i % 4) * 2,
    color: ["#1D4ED8", "#3B82F6", "#2563EB", "#60A5FA", "#1E3A8A", "#0EA5E9"][i % 6],
    phase: i * 0.7,
    speedX: 0.5 + (i % 3) * 0.3,
    speedY: 0.4 + (i % 4) * 0.25,
    speedZ: 0.3 + (i % 2) * 0.2,
    ampX: 15 + (i % 5) * 5,
    ampY: 12 + (i % 4) * 4,
    ampZ: 4 + (i % 3) * 2,
    rotX: 0, rotY: 0, rotZ: 0,
    mass: 0.3, baseOpacity: 0.3 + (i % 5) * 0.08, baseBlur: 1 + (i % 3),
  })),
];

// ─── Card content renderers ───────────────────────────────────────────────────
// Renders a stylized floating card displaying live startup analytics and performance metric summaries.
function CardStats() {
  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#22c55e", boxShadow: "0 0 6px #22c55e",
        }} />
        <span style={{
          fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)",
          letterSpacing: "0.12em", textTransform: "uppercase",
        }}>Live Analytics</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        {[{ label: "ARR", value: "$1.2M" }, { label: "Investors", value: "24" }, { label: "Score", value: "94/100" }].map(s => (
          <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 3, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: "78%", borderRadius: 2, background: "linear-gradient(90deg, #1D4ED8, #3B82F6)", boxShadow: "0 0 8px rgba(59,130,246,0.6)" }} />
      </div>
    </div>
  );
}

// Renders a stylized floating card visualizing AI-powered fundability scores and investor readiness status.
function CardScore() {
  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Fundability</span>
        <span style={{ fontSize: 10, fontWeight: 800, color: "#4ade80", background: "rgba(74,222,128,0.15)", padding: "2px 6px", borderRadius: 4 }}>↑ +12%</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "conic-gradient(#1D4ED8 0deg, #3B82F6 280deg, rgba(255,255,255,0.1) 280deg)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(10,10,30,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800, color: "#fff",
          }}>87</div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Investor Ready</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>AI-powered score</div>
        </div>
      </div>
    </div>
  );
}

// Renders a stylized floating card showcasing recent weekly investor view trends via bar graphs.
function CardMetric() {
  return (
    <div style={{ padding: "12px 14px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>This Week</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 36 }}>
        {[40, 65, 52, 80, 70, 95, 78].map((h, i) => (
          <div key={i} style={{
            flex: 1, height: `${h}%`, borderRadius: "2px 2px 0 0",
            background: i === 5
              ? "linear-gradient(180deg,#3B82F6,#1D4ED8)"
              : "rgba(255,255,255,0.15)",
            boxShadow: i === 5 ? "0 0 8px rgba(236,72,153,0.5)" : "none",
          }} />
        ))}
      </div>
      <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
        <span style={{ color: "#4ade80" }}>↑ 94</span> investor views
      </div>
    </div>
  );
}

// ─── Main AntigravityCanvas component ────────────────────────────────────────
// Renders a complex interactive canvas featuring floating orbs, cards, and particles with physics-based mouse repulsion.
export default function AntigravityCanvas() {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const physicsRef = useRef(OBJECTS.map(() => ({ vx: 0, vy: 0, dx: 0, dy: 0 })));
  const elRefs = useRef([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Mouse tracking
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };
    container.addEventListener("mousemove", onMove, { passive: true });
    container.addEventListener("mouseleave", onLeave, { passive: true });
    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    if (!container) return;

    const REPEL_RADIUS = 180;
    const REPEL_STRENGTH = 6500;
    const SPRING = 0.055;
    const DAMPING = 0.88;

    const tick = (timestamp) => {
      const t = timestamp * 0.001;
      const W = container.offsetWidth;
      const H = container.offsetHeight;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      OBJECTS.forEach((obj, i) => {
        const el = elRefs.current[i];
        if (!el) return;

        const phys = physicsRef.current[i];
        const halfW = obj.width ? obj.width / 2 : obj.size / 2;
        const halfH = obj.height ? obj.height / 2 : obj.size / 2;

        // Base sine-wave floating
        const baseX = (obj.x / 100) * W;
        const baseY = (obj.y / 100) * H;
        const floatX = Math.sin(t * obj.speedX + obj.phase) * obj.ampX;
        const floatY = Math.cos(t * obj.speedY + obj.phase * 0.7) * obj.ampY;

        // Mouse repulsion
        const cx = baseX + floatX + halfW + phys.dx;
        const cy = baseY + floatY + halfH + phys.dy;
        const distX = cx - mx;
        const distY = cy - my;
        const dist = Math.sqrt(distX * distX + distY * distY) || 1;

        if (dist < REPEL_RADIUS) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          const strength = REPEL_STRENGTH * force * force / (obj.mass || 1);
          phys.vx += (distX / dist) * strength * 0.001;
          phys.vy += (distY / dist) * strength * 0.001;
        }

        // Spring back + damping
        phys.vx += -phys.dx * SPRING;
        phys.vy += -phys.dy * SPRING;
        phys.vx *= DAMPING;
        phys.vy *= DAMPING;
        phys.dx += phys.vx;
        phys.dy += phys.vy;

        // Final position
        const finalX = baseX + floatX + phys.dx - halfW;
        const finalY = baseY + floatY + phys.dy - halfH;

        // 3D rotation
        const rx = Math.sin(t * obj.rotX * 0.5 + obj.phase) * 22;
        const ry = Math.cos(t * obj.rotY * 0.4 + obj.phase * 0.8) * 30;
        const rz = Math.sin(t * obj.rotZ * 0.3 + obj.phase * 1.2) * 15;

        // Depth: Z axis -> scale + depth opacity
        const zNorm = ((obj.z || 0) + 65) / 130;
        const scale = 0.72 + zNorm * 0.56;
        const depthOpacity = obj.baseOpacity * (0.55 + zNorm * 0.45);
        const depthBlur = (obj.baseBlur || 0) * 0.5 * (1 - zNorm * 0.6);

        el.style.transform = `translate(${finalX.toFixed(1)}px, ${finalY.toFixed(1)}px) scale(${scale.toFixed(3)}) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
        el.style.opacity = depthOpacity.toFixed(3);
        el.style.filter = depthBlur > 0.3 ? `blur(${depthBlur.toFixed(2)}px)` : "none";
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [mounted]);

  // Ambient orb configs
  const ambientOrbs = [
    { left: "15%", top: "20%", size: 700, color: "rgba(139,92,246,0.13)", dur: 9 },
    { left: "78%", top: "15%", size: 600, color: "rgba(236,72,153,0.1)", dur: 11 },
    { left: "55%", top: "78%", size: 500, color: "rgba(59,130,246,0.08)", dur: 13 },
    { left: "5%",  top: "72%", size: 400, color: "rgba(34,197,94,0.07)", dur: 8 },
  ];

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        perspective: "1200px",
        perspectiveOrigin: "50% 50%",
        zIndex: 1,
        pointerEvents: "all",
      }}
    >
      {/* Ambient lighting blobs */}
      {ambientOrbs.map((orb, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: orb.left,
            top: orb.top,
            width: orb.size,
            height: orb.size,
            transform: "translate(-50%,-50%)",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            pointerEvents: "none",
            animation: `agPulse ${orb.dur}s ease-in-out infinite alternate`,
            animationDelay: `${i * 1.8}s`,
          }}
        />
      ))}

      {/* Floating objects */}
      {mounted && OBJECTS.map((obj, i) => {
        const wrapStyle = {
          position: "absolute",
          top: 0, left: 0,
          willChange: "transform, opacity, filter",
          transformStyle: "preserve-3d",
          pointerEvents: "none",
        };

        let inner = null;

        if (obj.type === "orb") {
          inner = (
            <div style={{
              width: obj.size, height: obj.size,
              borderRadius: "50%",
              background: obj.color,
              boxShadow: `0 0 ${obj.size * 0.6}px ${obj.size * 0.15}px ${obj.glowColor},
                          inset 0 2px 8px rgba(255,255,255,0.35),
                          inset -2px -4px 12px rgba(0,0,0,0.2)`,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: "12%", left: "18%",
                width: "28%", height: "20%", borderRadius: "50%",
                background: "rgba(255,255,255,0.45)", filter: "blur(4px)",
              }} />
              <div style={{
                position: "absolute", bottom: "10%", right: "12%",
                width: "15%", height: "12%", borderRadius: "50%",
                background: "rgba(255,255,255,0.18)", filter: "blur(3px)",
              }} />
            </div>
          );
        } else if (obj.type === "card") {
          inner = (
            <div style={{
              width: obj.width, height: obj.height,
              borderRadius: 16,
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.08) inset, 0 1px 0 rgba(255,255,255,0.2) inset",
              overflow: "hidden", position: "relative",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 1,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              }} />
              {obj.content === "card-stats" && <CardStats />}
              {obj.content === "card-score" && <CardScore />}
              {obj.content === "card-metric" && <CardMetric />}
            </div>
          );
        } else if (obj.type === "geo") {
          const clipMap = {
            triangle: "polygon(50% 0%, 0% 100%, 100% 100%)",
            diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            hexagon: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
            "circle-ring": "none",
          };
          inner = (
            <div style={{
              width: obj.size, height: obj.size,
              background: obj.color || "transparent",
              border: obj.border || "none",
              borderRadius: obj.shape === "circle-ring" ? "50%" : 0,
              clipPath: clipMap[obj.shape] || "none",
              boxShadow: `0 0 ${obj.size * 0.8}px ${obj.size * 0.1}px ${obj.glowColor}`,
            }} />
          );
        } else if (obj.type === "particle") {
          inner = (
            <div style={{
              width: obj.size, height: obj.size,
              borderRadius: "50%",
              background: obj.color,
              boxShadow: `0 0 ${obj.size * 3}px ${obj.size}px ${obj.color}55`,
            }} />
          );
        }

        return (
          <div key={obj.id} ref={el => { elRefs.current[i] = el; }} style={wrapStyle}>
            {inner}
          </div>
        );
      })}

      {/* Injected keyframes */}
      <style>{`
        @keyframes agPulse {
          from { opacity: 0.5; transform: translate(-50%,-50%) scale(0.88); }
          to   { opacity: 1.0; transform: translate(-50%,-50%) scale(1.12); }
        }
      `}</style>
    </div>
  );
}
