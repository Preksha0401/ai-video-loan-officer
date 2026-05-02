import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPanel from "../components/VideoPanel";
import TranscriptPanel from "../components/TranscriptPanel";
import TrustMeter from "../components/TrustMeter";
import StatusBar from "../components/StatusBar";
import useTrustScore from "../hooks/useTrustScore";
import useInterview from "../hooks/useInterview";
import useSTT from "../hooks/useSTT";
import useFaceAnalysis from "../hooks/useFaceAnalysis";
import {useCallback } from "react";
/* ─── small utility: flash highlight on data change ─── */
function useFlashOnChange(value) {
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value && value !== null) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 700);
      prev.current = value;
      return () => clearTimeout(t);
    }
    prev.current = value;
  }, [value]);
  return flash;
}

/* ─── reusable card wrapper ─── */
function ModuleCard({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-200 ${className}`}
      style={{
        background: "#ffffff",
        border: "1px solid rgba(229,231,235,0.8)",
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.7) inset",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── module header ─── */
function ModuleHeader({ icon, title, right }) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-3 shrink-0"
      style={{
        borderBottom: "1px solid rgba(229,231,235,0.6)",
        background: "linear-gradient(180deg, #FAFBFF 0%, #ffffff 100%)",
      }}
    >
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)" }}
      >
        <span style={{ color: "#2563EB" }}>{icon}</span>
      </div>
      <span
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: "#9CA3AF", letterSpacing: "0.1em" }}
      >
        {title}
      </span>
      {right && <div className="ml-auto">{right}</div>}
    </div>
  );
}

/* ─── Animated Robot Avatar ─── */
function RobotAvatar({ isSpeaking }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 44, height: 44 }}>
      {/* Pulse ring when speaking */}
      {isSpeaking && (
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: "rgba(96,165,250,0.25)",
            animationDuration: "1.2s",
          }}
        />
      )}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center relative z-10"
        style={{
          background: "linear-gradient(135deg, #1D4ED8, #2563EB)",
          boxShadow: isSpeaking
            ? "0 0 0 3px rgba(96,165,250,0.4), 0 2px 10px rgba(37,99,235,0.5)"
            : "0 2px 10px rgba(37,99,235,0.35)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Robot SVG face */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          {/* Head */}
          <rect x="4" y="6" width="16" height="13" rx="3" fill="white" fillOpacity="0.9" />
          {/* Antenna */}
          <line x1="12" y1="6" x2="12" y2="3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="2.5" r="1.2" fill="white" />
          {/* Eyes */}
          <rect x="7.5" y="10" width="3" height="3" rx="1" fill="#2563EB" />
          <rect x="13.5" y="10" width="3" height="3" rx="1" fill="#2563EB" />
          {/* Eye glow when speaking */}
          {isSpeaking && (
            <>
              <rect x="7.5" y="10" width="3" height="3" rx="1" fill="#60A5FA" fillOpacity="0.8" />
              <rect x="13.5" y="10" width="3" height="3" rx="1" fill="#60A5FA" fillOpacity="0.8" />
            </>
          )}
          {/* Mouth */}
          {isSpeaking ? (
            // Open mouth when speaking
            <rect x="8.5" y="14.5" width="7" height="2.5" rx="1.2" fill="#2563EB" />
          ) : (
            // Smile when idle
            <path d="M8.5 15.5 Q12 17.5 15.5 15.5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          )}
        </svg>
      </div>
    </div>
  );
}

export default function CallPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const trust = useTrustScore(sessionId);
  const { messages, handleUserMessage, data } = useInterview(sessionId);
  const { startRecording, stopRecording } = useSTT(handleUserMessage);

  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const videoRef = useRef(null);
  const missedFrames = useRef(null);
  const lastSpokenRef = useRef("");
  const { faceData } = useFaceAnalysis(sessionId, videoRef);
  const [stableFaceData, setStableFaceData] = useState(null);

  useEffect(() => {
    if (faceData?.face_detected) {
      missedFrames.current = 0;
      setStableFaceData(faceData);
    } else {
      missedFrames.current += 1;
      if (missedFrames.current >= 2) setStableFaceData(faceData);
    }
  }, [faceData]);

// ── Voices ref: populated once voiceschanged fires ──
const voicesRef = useRef([]);
useEffect(() => {
  if (!("speechSynthesis" in window)) return;
  const load = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
  load(); // populate immediately (works in Firefox)
  window.speechSynthesis.addEventListener("voiceschanged", load);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
}, []);

// ── speak() helper — call from a user-gesture handler ──
// ONLY showing the changed parts — everything else stays SAME

// ── speak() helper — FIXED ──
const speak = useCallback((text) => {
  console.log("🗣 speak() called with:", text);

  if (!("speechSynthesis" in window)) {
    console.log("❌ speechSynthesis NOT supported");
    return;
  }

  console.log("🎤 voices available:", voicesRef.current);

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.rate = 1.0;
  utterance.pitch = 1.05;
  utterance.volume = 1;

  // 🌍 Detect language (Hindi + Marathi use Devanagari)
  const detectLang = (text) => {
    if (/[\u0900-\u097F]/.test(text)) return "hi-IN"; // Hindi + Marathi
    return "en-US"; // default English
  };

  const lang = detectLang(text);
  console.log("🌍 Detected language:", lang);

  // 🎤 Find matching voice
  let preferred = voicesRef.current.find(v =>
    v.lang.toLowerCase().includes(lang.toLowerCase())
  );

  // fallback: short code match (hi / en)
  if (!preferred) {
    const short = lang.split("-")[0];
    preferred = voicesRef.current.find(v =>
      v.lang.toLowerCase().startsWith(short)
    );
  }

  // final fallback → English
  if (!preferred) {
    preferred = voicesRef.current.find(v =>
      v.lang.toLowerCase().includes("en")
    );
    console.log("⚠️ fallback to English voice");
  }

  if (preferred) {
    console.log("✅ Using voice:", preferred.name, preferred.lang);
    utterance.voice = preferred;
  }

  // 🔥 IMPORTANT
  utterance.lang = lang;

  utterance.onstart = () => {
    console.log("▶️ SPEECH STARTED");
    setIsSpeaking(true);
    lastSpokenRef.current = text;
  };

  utterance.onend = () => {
    console.log("⏹ SPEECH ENDED");
    setIsSpeaking(false);
  };

  utterance.onerror = (e) => {
    console.log("❌ SPEECH ERROR:", e);
    setIsSpeaking(false);
  };

  window.speechSynthesis.speak(utterance);

  console.log("📢 speechSynthesis.speak() called");

}, []);
// ── TTS: speak latest AI message ──
const pendingSpeechRef = useRef(null);
useEffect(() => {
  if (!messages?.length) return;

  const lastMsg = messages[messages.length - 1];

  console.log("🧠 FULL MESSAGE:", lastMsg);

  // ✅ FIX: correct field
  if (lastMsg?.speaker !== "AI") return;

  const text = lastMsg.text;

  console.log("💾 storing:", text);

  pendingSpeechRef.current = text;

}, [messages]);

// ── Flush pending speech on first user gesture ──
const hasSpeechPermission = useRef(false);
const flushPending = useCallback(() => {
  console.log("🟢 flushPending called");

  hasSpeechPermission.current = true;

  if (pendingSpeechRef.current) {
    console.log("🗣 Speaking pending:", pendingSpeechRef.current);
    speak(pendingSpeechRef.current);
    pendingSpeechRef.current = null;
  } else {
    console.log("⚠️ No pending speech");
  }
}, [speak]);

// ── Speak immediately once permission is established ──
useEffect(() => {
  console.log("🔁 speak effect triggered");

  if (!hasSpeechPermission.current) {
    console.log("⛔ No speech permission yet");
    return;
  }

  if (!messages?.length) return;

  const lastMsg = messages[messages.length - 1];

  console.log("🧠 checking message:", lastMsg);

  // ✅ FIX: correct field
  if (lastMsg?.speaker !== "AI") {
    console.log("⛔ Not AI message");
    return;
  }

  const text = lastMsg.text;

  console.log("🆕 Candidate to speak:", text);

  if (text === lastSpokenRef.current) {
    console.log("⛔ Skipping (already spoken)");
    return;
  }

  console.log("🚀 Calling speak()");
  speak(text);

}, [messages, speak]);
  // Timer
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // 🔴 Flash body border when trust drops below 50
  useEffect(() => {
    if (trust.score < 50) {
      document.body.classList.add("border-red-500");
      const t = setTimeout(() => document.body.classList.remove("border-red-500"), 800);
      return () => clearTimeout(t);
    }
  }, [trust.score]);

  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (s) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;

  const handleStart = () => {
  flushPending();  // ← add this line
  startRecording();
  setIsRecording(true);
};

const handleStop = () => {
  stopRecording();
  setIsRecording(false);
};

  const handleEndCall = async () => {
    window.speechSynthesis?.cancel();
    try {
      const trustRes  = await fetch(`http://localhost:8000/trust/${sessionId}`);
      const trustData = await trustRes.json();
      console.log("📊 Final Trust Before Decision:", trustData);

      const res    = await fetch("http://localhost:8000/decision/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const result = await res.json();
      navigate(`/decision/${sessionId}`, { state: result });
    } catch (err) {
      console.error("Decision error:", err);
      navigate(`/decision/${sessionId}`);
    }
  };

  // Risk band derived from trust score
  const band = trust.score >= 75 ? "low" : trust.score >= 50 ? "medium" : "high";
  const risk = {
    low:    { bg: "rgba(34,197,94,0.1)",  fg: "#15803D", label: "Low Risk",    glow: "rgba(34,197,94,0.2)"  },
    medium: { bg: "rgba(245,158,11,0.1)", fg: "#A16207", label: "Medium Risk", glow: "rgba(245,158,11,0.2)" },
    high:   { bg: "rgba(239,68,68,0.1)",  fg: "#B91C1C", label: "High Risk",   glow: "rgba(239,68,68,0.2)"  },
  }[band];

  // Flash hooks for extracted data fields
  const incomeFlash  = useFlashOnChange(data.income);
  const employFlash  = useFlashOnChange(data.employment);
  const purposeFlash = useFlashOnChange(data.loan_purpose);
  const amountFlash  = useFlashOnChange(data.loan_amount);

  const dataRows = [
    { label: "Income",           val: data.income       ? `₹${data.income}/mo`   : null, flash: incomeFlash  },
    { label: "Employment",       val: data.employment   || null,                          flash: employFlash  },
    { label: "Loan Purpose",     val: data.loan_purpose || null,                          flash: purposeFlash },
    { label: "Requested Amount", val: data.loan_amount  ? `₹${data.loan_amount}` : null, flash: amountFlash  },
  ];

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #F0F4FF 0%, #F5F7FB 40%, #EFF6FF 100%)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        backgroundImage:
          "linear-gradient(135deg, #F0F4FF 0%, #F5F7FB 40%, #EFF6FF 100%), radial-gradient(circle, rgba(37,99,235,0.035) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 28px 28px",
      }}
    >
      {/* ── NAV ─────────────────────────────────────── */}
      <nav
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{
          /* FIX: solid dark background so nav text is always visible */
          background: "linear-gradient(90deg, #1E3A8A 0%, #1D4ED8 60%, #2563EB 100%)",
          boxShadow: "0 4px 24px rgba(17,37,90,0.35)",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {/* Brand + Robot */}
        <div className="flex items-center gap-3">
          {/* Robot avatar replaces old icon */}
          <RobotAvatar isSpeaking={isSpeaking} />
          <div>
            <div className="text-sm font-bold leading-tight" style={{ color: "#FFFFFF" }}>
              TenzorX AI Loan Officer
            </div>
            <div className="text-xs flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.65)" }}>
              {isSpeaking ? (
                <>
                  <span
                    className="inline-flex gap-0.5 items-end"
                    style={{ height: 12 }}
                  >
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <span
                        key={i}
                        style={{
                          display: "inline-block",
                          width: 3,
                          borderRadius: 2,
                          background: "#60A5FA",
                          animation: "aiWave 0.7s ease-in-out infinite",
                          animationDelay: `${delay}s`,
                        }}
                      />
                    ))}
                  </span>
                  AI is speaking…
                </>
              ) : (
                "Live Interview Session"
              )}
            </div>
          </div>
        </div>

        {/* Center: indicators */}
        <div className="flex items-center gap-4">
          {isRecording && (
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{
                background: "rgba(239,68,68,0.18)",
                color: "#FCA5A5",
                border: "1px solid rgba(239,68,68,0.4)",
                boxShadow: "0 0 8px rgba(239,68,68,0.25)",
              }}
            >
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              RECORDING
            </span>
          )}

          {/* Timer */}
          <span
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "#E0EAFF",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
            </svg>
            {fmt(seconds)}
          </span>

          {/* Session ID */}
          <span
            className="text-xs font-mono px-2.5 py-1 rounded-md"
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "#BFDBFE",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            #{sessionId?.slice(0, 8)}
          </span>
        </div>

        {/* End Call */}
        {!showEndConfirm ? (
          <button
            onClick={() => setShowEndConfirm(true)}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #EF4444, #DC2626)",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(239,68,68,0.4)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
            End Call
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>End interview?</span>
            <button
              onClick={handleEndCall}
              className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ background: "#EF4444", color: "#fff", boxShadow: "0 2px 6px rgba(239,68,68,0.4)" }}
            >
              Yes, End
            </button>
            <button
              onClick={() => setShowEndConfirm(false)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.15)", color: "#E0EAFF", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              Cancel
            </button>
          </div>
        )}
      </nav>

      {/* wave animation keyframe */}
      <style>{`
        @keyframes aiWave {
          0%, 100% { height: 4px; }
          50%       { height: 12px; }
        }
      `}</style>

      {/* ── STATUS BAR ───────────────────────────────── */}
      <StatusBar
        faceDetected={stableFaceData?.face_detected}
        livenessOk={stableFaceData?.liveness_passed}
        isRecording={isRecording}
      />

      {/* ── MAIN GRID ────────────────────────────────── */}
      <div
        className="flex-1 grid p-4 gap-4 min-h-0"
        style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
      >
        {/* ── COL 1: VIDEO ─── */}
        <div className="flex flex-col gap-3 min-h-0">
          <ModuleCard
            className="flex-1 relative min-h-0"
            style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <VideoPanel videoRef={videoRef} faceData={stableFaceData} />
          </ModuleCard>

          {/* Controls */}
          <div className="flex gap-2.5 justify-center shrink-0">
            <button
              onClick={handleStart}
              disabled={isRecording}
              className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #22C55E, #16A34A)",
                color: "#fff",
                boxShadow: isRecording ? "none" : "0 3px 12px rgba(34,197,94,0.35)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={e => { if (!isRecording) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4zm-1 17.93A8 8 0 014.07 12H6a6 6 0 0012 0h1.93A8 8 0 0113 18.93V21h2v2H9v-2h2v-2.07z" />
              </svg>
              Start Speaking
            </button>
            <button
              onClick={handleStop}
              disabled={!isRecording}
              className="flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #D97706)",
                color: "#fff",
                boxShadow: !isRecording ? "none" : "0 3px 12px rgba(245,158,11,0.35)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={e => { if (isRecording) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              Stop
            </button>
          </div>
        </div>

        {/* ── COL 2: TRANSCRIPT ─── */}
        <ModuleCard className="flex flex-col min-h-0">
          <ModuleHeader
            icon={
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            }
            title="Transcript"
            right={
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #DBEAFE" }}
              >
                {messages.length} msg{messages.length !== 1 ? "s" : ""}
              </span>
            }
          />
          <div className="flex-1 overflow-hidden min-h-0">
            <TranscriptPanel messages={messages} />
          </div>
        </ModuleCard>

        {/* ── COL 3: ANALYSIS ─── */}
        {/* FIX: use overflow-y-auto with min-h-0 so the column can actually scroll */}
        <div
          className="flex flex-col gap-3 min-h-0 overflow-y-auto pr-0.5"
          style={{ scrollbarWidth: "none" }}
        >

          {/* Trust Score Module */}
          <ModuleCard
            style={{
              flexShrink: 0,
              boxShadow: `0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.8) inset, 0 0 20px ${risk.glow}`,
            }}
          >
            <ModuleHeader
              icon={
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="Trust Score"
              right={
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: risk.bg,
                    color: risk.fg,
                    border: `1px solid ${risk.glow}`,
                    boxShadow: `0 0 8px ${risk.glow}`,
                  }}
                >
                  {risk.label}
                </span>
              }
            />
            {/* FIX: removed overflow:hidden from card so TrustMeter gauge isn't clipped */}
            <div className="px-4 py-3">
              <TrustMeter score={trust.score} />
              {trust.explanation?.length > 0 && (
                <div
                  className="mt-3 space-y-2 pt-3"
                  style={{ borderTop: "1px solid rgba(229,231,235,0.5)" }}
                >
                  {trust.explanation.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "#6B7280" }}>
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "rgba(37,99,235,0.08)" }}
                      >
                        <div className="w-1 h-1 rounded-full" style={{ background: "#60A5FA" }} />
                      </div>
                      {e}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ModuleCard>

          {/* Extracted Data Module */}
          <ModuleCard style={{ flexShrink: 0 }}>
            <ModuleHeader
              icon={
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              title="Extracted Data"
            />
            <div className="px-4 py-2">
              {dataRows.map(({ label, val, flash }) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2.5 transition-all duration-300"
                  style={{
                    borderBottom: "1px solid rgba(229,231,235,0.4)",
                    background: flash ? "rgba(37,99,235,0.04)" : "transparent",
                    borderRadius: flash ? "8px" : "0",
                    padding: flash ? "10px 8px" : undefined,
                    margin: flash ? "0 -8px" : undefined,
                  }}
                >
                  <span className="text-xs flex items-center gap-1.5" style={{ color: "#9CA3AF" }}>
                    <div className="w-1 h-1 rounded-full" style={{ background: "#394e79" }} />
                    {label}
                  </span>
                  <span
                    className="text-xs font-bold transition-all duration-300"
                    style={{
                      color: val ? "#111827" : "#2563EB",
                      transform: flash ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    {val || "—"}
                  </span>
                </div>
              ))}
            </div>
          </ModuleCard>

          {/* Face Analysis Module */}
          <ModuleCard style={{ flexShrink: 0 }}>
            <ModuleHeader
              icon={
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Face Analysis"
              right={
                stableFaceData?.face_detected ? (
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)" }}
                  >
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                    Live
                  </div>
                ) : null
              }
            />
            <div className="px-4 py-3 grid grid-cols-3 gap-2">
              {[
                {
                  label: "Detected",
                  val: stableFaceData?.face_detected ? "✓" : "—",
                  color: stableFaceData?.face_detected ? "#22C55E" : "#9CA3AF",
                  bg: stableFaceData?.face_detected ? "rgba(34,197,94,0.08)" : "#F9FAFB",
                  glow: stableFaceData?.face_detected ? "0 0 12px rgba(34,197,94,0.15)" : "none",
                },
                {
                  label: "Emotion",
                  val: stableFaceData?.dominant_emotion || "—",
                  color: "#002f96",
                  bg: "rgba(37,99,235,0.05)",
                  glow: "none",
                },
                {
                  label: "Confidence",
                  val: stableFaceData?.confidence
                    ? `${Math.round(stableFaceData.confidence * 100)}%`
                    : "—",
                  color: "#111827",
                  bg: "#F9FAFB",
                  glow: "none",
                },
              ].map(({ label, val, color, bg, glow }) => (
                <div
                  key={label}
                  className="rounded-xl py-3 px-2 text-center"
                  style={{
                    background: bg,
                    border: "1px solid rgba(229,231,235,0.5)",
                    boxShadow: glow,
                  }}
                >
                  <div className="text-sm font-bold" style={{ color }}>{val}</div>
                  <div className="text-xs mt-1" style={{ color: "#9CA3AF", fontSize: "0.65rem" }}>{label}</div>
                </div>
              ))}
            </div>
          </ModuleCard>

        </div>
      </div>
    </div>
  );
}