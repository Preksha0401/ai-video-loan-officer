import { useEffect, useState } from "react";

export default function TrustMeter({ score }) {
  const [display, setDisplay] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let current = display;
    const target = score;
    if (current === target) return;

    // Flash on update
    setFlash(true);
    setTimeout(() => setFlash(false), 600);

    const step = target > current ? 1 : -1;
    const interval = setInterval(() => {
      current += step;
      setDisplay(current);
      if (current === target) clearInterval(interval);
    }, 12);

    return () => clearInterval(interval);
  }, [score]);

  const R = 72;
  const CX = 100, CY = 92;
  const total = Math.PI;
  const angle = (display / 100) * total;
  const x = CX + R * Math.cos(Math.PI - angle);
  const y = CY - R * Math.sin(angle);

  const circumference = Math.PI * R;
  const filled = (display / 100) * circumference;

  const color = display >= 75 ? "#22C55E" : display >= 50 ? "#F59E0B" : "#EF4444";
  const colorRgb = display >= 75 ? "34,197,94" : display >= 50 ? "245,158,11" : "239,68,68";
  const label = display >= 75 ? "Excellent" : display >= 50 ? "Moderate" : "Low Trust";
  const gradId = `trustGrad_${display >= 75 ? "g" : display >= 50 ? "y" : "r"}`;

  // Tick marks for scale feel
  const ticks = [0, 25, 50, 75, 100].map((pct) => {
    const a = (pct / 100) * Math.PI;
    const rx = CX + (R + 10) * Math.cos(Math.PI - a);
    const ry = CY - (R + 10) * Math.sin(a);
    return { rx, ry, pct };
  });

  return (
    <div
      className="flex flex-col items-center rounded-xl p-3 transition-all duration-300"
      style={{
        background: flash
          ? `rgba(${colorRgb},0.06)`
          : "transparent",
        transition: "background 0.4s ease",
      }}
    >
      {/* AI SYSTEM label */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 4px rgba(${colorRgb},0.8)` }} />
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#9CA3AF", fontSize: "0.6rem", letterSpacing: "0.15em" }}>
          AI Trust Engine
        </span>
        <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 4px rgba(${colorRgb},0.8)`, animationDelay: "0.5s" }} />
      </div>

      <svg viewBox="0 0 200 110" className="w-full" style={{ maxWidth: 210 }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer glow ring (background arc) */}
        <path
          d={`M ${CX - R - 8} ${CY} A ${R + 8} ${R + 8} 0 0 1 ${CX + R + 8} ${CY}`}
          fill="none"
          stroke={`rgba(${colorRgb},0.06)`}
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Background track */}
        <path
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Subtle segment lines on track */}
        {[25, 50, 75].map((pct) => {
          const a = (pct / 100) * Math.PI;
          const ix = CX + R * Math.cos(Math.PI - a);
          const iy = CY - R * Math.sin(a);
          const ox = CX + (R - 5) * Math.cos(Math.PI - a);
          const oy = CY - (R - 5) * Math.sin(a);
          return (
            <line key={pct} x1={ix} y1={iy} x2={ox} y2={oy}
              stroke="white" strokeWidth="1.5" opacity="0.8" />
          );
        })}

        {/* Colored filled arc with glow */}
        <path
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.05s linear", filter: `drop-shadow(0 0 4px rgba(${colorRgb},0.6))` }}
        />

        {/* Tick labels */}
        {[0, 50, 100].map(({ pct } = ticks.find(t => [0, 50, 100].includes(t.pct)) || {}, idx) => {
          const ps = [0, 50, 100];
          const p = ps[idx];
          if (p === undefined) return null;
          const a = (p / 100) * Math.PI;
          const lx = CX + (R + 18) * Math.cos(Math.PI - a);
          const ly = CY - (R + 18) * Math.sin(a);
          return (
            <text key={p} x={lx} y={ly + 3} textAnchor="middle" fontSize="7" fill="#D1D5DB" fontFamily="system-ui">
              {p}
            </text>
          );
        })}

        {/* Needle with glow */}
        <line
          x1={CX} y1={CY}
          x2={x} y2={y}
          stroke="#111827"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))", transition: "x2 0.05s linear, y2 0.05s linear" }}
        />

        {/* Needle center pivot */}
        <circle cx={CX} cy={CY} r="6" fill="#1E293B" />
        <circle cx={CX} cy={CY} r="3" fill={color} style={{ filter: `drop-shadow(0 0 3px rgba(${colorRgb},0.8))` }} />

        {/* Score display */}
        <text x={CX} y={CY + 22} textAnchor="middle" fontSize="22" fontWeight="800" fill="#111827" fontFamily="system-ui">
          {display}
        </text>
        <text x={CX} y={CY + 33} textAnchor="middle" fontSize="7.5" fill="#9CA3AF" fontFamily="system-ui" letterSpacing="1">
          TRUST SCORE
        </text>
      </svg>

      {/* Band label with glow */}
      <div
        className="mt-1 text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5"
        style={{
          background: `rgba(${colorRgb}, 0.1)`,
          color,
          border: `1px solid rgba(${colorRgb}, 0.25)`,
          boxShadow: `0 0 12px rgba(${colorRgb}, 0.15)`,
          letterSpacing: "0.05em",
        }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 5px rgba(${colorRgb},0.8)` }} />
        {label}
      </div>
    </div>
  );
}