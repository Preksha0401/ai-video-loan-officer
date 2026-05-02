import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPanel from "../components/VideoPanel";
import TranscriptPanel from "../components/TranscriptPanel";
import TrustMeter from "../components/TrustMeter";
import StatusBar from "../components/StatusBar";

import useInterview from "../hooks/useInterview";
import useSTT from "../hooks/useSTT";

export default function CallPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { messages, handleUserMessage, data } = useInterview(sessionId);
  const { startRecording, stopRecording } = useSTT(handleUserMessage);

  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (sec) => {
    const mins = String(Math.floor(sec / 60)).padStart(2, "0");
    const secs = String(sec % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleStart = () => { startRecording(); setIsRecording(true); };
  const handleStop = () => { stopRecording(); setIsRecording(false); };
  const handleEndCall = () => navigate(`/decision/${sessionId}`);

  return (
    <div className="h-screen flex flex-col bg-[#0f1923] text-white overflow-hidden">

      {/* TOP NAV BAR */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#141f2b] border-b border-white/10 shrink-0">
        {/* Left: brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-semibold text-white text-sm">TenzorX AI Loan Interview</span>
        </div>

        {/* Center: session + timer */}
        <div className="flex items-center gap-4 text-xs text-gray-400">
          {isRecording && (
            <div className="flex items-center gap-1.5 text-red-400 font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              RECORDING
            </div>
          )}
          <div className="font-mono text-gray-300">⏱ {formatTime(seconds)}</div>
          <div className="font-mono text-gray-500">ID: {sessionId?.slice(0, 8)}…</div>
        </div>

        {/* Right: end call */}
        {!showEndConfirm ? (
          <button
            onClick={() => setShowEndConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            End Call
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">End interview?</span>
            <button onClick={handleEndCall} className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg">Yes, End</button>
            <button onClick={() => setShowEndConfirm(false)} className="bg-gray-700 text-white text-xs px-3 py-1.5 rounded-lg">Cancel</button>
          </div>
        )}
      </div>

      {/* STATUS BAR (Phase 1 component) */}
      <StatusBar />

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT - VIDEO PANEL */}
        <div className="w-[48%] p-4 relative flex flex-col">
          <div className="relative flex-1 rounded-xl overflow-hidden">
            <VideoPanel />
            {isRecording && (
              <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span> LIVE
              </div>
            )}
          </div>

          {/* MIC CONTROLS */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={handleStart}
              disabled={isRecording}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a4 4 0 014 4v6a4 4 0 01-8 0V5a4 4 0 014-4zm-1 17.93A8.001 8.001 0 014.07 12H6a6 6 0 0012 0h1.93A8.001 8.001 0 0113 18.93V21h2v2H9v-2h2v-2.07z"/>
              </svg>
              Start Speaking
            </button>
            <button
              onClick={handleStop}
              disabled={!isRecording}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
              Stop
            </button>
          </div>
        </div>

        {/* CENTER - TRANSCRIPT */}
        <div className="w-[28%] p-4 flex flex-col">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">Interview Transcript</div>
          <div className="flex-1 rounded-xl overflow-hidden bg-[#141f2b] border border-white/10">
            <TranscriptPanel messages={messages} />
          </div>
        </div>

        {/* RIGHT - ANALYSIS PANEL */}
        <div className="w-[24%] p-4 flex flex-col gap-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-widest">Live Analysis</div>

          {/* DATA CARD */}
          <div className="bg-[#141f2b] border border-white/10 rounded-xl p-4 space-y-3">
            {[
              { label: "Income", value: data.income ? `₹${data.income}/mo` : "—" },
              { label: "Employment", value: data.employment || "—" },
              { label: "Loan Purpose", value: data.loan_purpose || "—" },
              { label: "Requested Amount", value: data.loan_amount ? `₹${data.loan_amount}` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-xs font-medium text-gray-200">{value}</span>
              </div>
            ))}
          </div>

          {/* TRUST METER */}
          <div className="bg-[#141f2b] border border-white/10 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-3">Trust Score</div>
            <TrustMeter score={70} />
          </div>

          {/* RAW DATA (collapsible dev view) */}
          <details className="bg-[#141f2b] border border-white/10 rounded-xl overflow-hidden text-xs">
            <summary className="px-4 py-2.5 cursor-pointer text-gray-500 select-none">Raw Data ▾</summary>
            <pre className="px-4 pb-3 text-gray-400 overflow-auto max-h-36">{JSON.stringify(data, null, 2)}</pre>
          </details>
        </div>
      </div>
    </div>
  );
}