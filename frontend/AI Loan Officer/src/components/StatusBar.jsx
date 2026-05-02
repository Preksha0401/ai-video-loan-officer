export default function StatusBar({ faceDetected, livenessOk, isRecording }) {
  const items = [
    {
      label: "Face Verified",
      ok: !!faceDetected,
      okText: "Verified",
      failText: "Not Detected",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Liveness",
      ok: livenessOk !== false,
      okText: "Passed",
      failText: "Checking…",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      label: "Audio",
      ok: isRecording,
      okText: "Capturing",
      failText: "Idle",
      icon: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="flex items-center justify-center gap-8 px-6 py-2 shrink-0"
      style={{
        background: "rgba(52, 103, 222, 0.95)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        backdropFilter: "blur(4px)",
      }}
    >
      {/* Left label */}
      <div className="flex items-center gap-1.5 mr-2">
        <div className="w-1 h-4 rounded-full" style={{ background: "linear-gradient(180deg, #2563EB, #60A5FA)" }} />
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#4B5563", letterSpacing: "0.12em" }}>
          System Status
        </span>
      </div>

      <div className="h-4 w-px" style={{ background: "rgba(255,255,255,0.06)" }} />

      {items.map((item, idx) => (
        <div key={item.label} className="flex items-center gap-2 group">
          {/* Indicator dot */}
          <div className="relative flex items-center justify-center">
            <div
              className="w-1.5 h-1.5 rounded-full transition-all duration-500"
              style={{
                background: item.ok ? "#22C55E" : "#374151",
                boxShadow: item.ok
                  ? "0 0 0 2px rgba(34,197,94,0.15), 0 0 6px rgba(34,197,94,0.4)"
                  : "none",
              }}
            />
            {item.ok && (
              <div
                className="absolute w-3 h-3 rounded-full animate-ping"
                style={{ background: "rgba(34,197,94,0.15)", animationDuration: "2s" }}
              />
            )}
          </div>

          {/* Icon */}
          <span style={{ color: item.ok ? "#60A5FA" : "#4B5563" }}>{item.icon}</span>

          {/* Label + value */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium" style={{ color: "#6B7280" }}>
              {item.label}
            </span>
            <span className="text-xs" style={{ color: "#374151" }}>·</span>
            <span
              className="text-xs font-semibold"
              style={{
                color: item.ok ? "#4ADE80" : "#4B5563",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {item.ok ? item.okText : item.failText}
            </span>
          </div>

          {idx < items.length - 1 && (
            <div className="ml-4 h-3 w-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          )}
        </div>
      ))}

      {/* AI Active chip */}
      <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full"
        style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.2)" }}>
        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#60A5FA" }}>
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-xs font-semibold" style={{ color: "#60A5FA" }}>AI Active</span>
      </div>
    </div>
  );
}