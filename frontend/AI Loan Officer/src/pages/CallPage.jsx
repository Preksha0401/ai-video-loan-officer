import { useState, useEffect } from "react";

import VideoPanel from "../components/VideoPanel";
import TranscriptPanel from "../components/TranscriptPanel";
import TrustMeter from "../components/TrustMeter";
import StatusBar from "../components/StatusBar";

import useInterview from "../hooks/useInterview";
import useSTT from "../hooks/useSTT";

export default function CallPage({ onEnd }) {
  const sessionId = "demo-session";

  const { messages, handleUserMessage, data } = useInterview(sessionId);
  const { startRecording, stopRecording } = useSTT(handleUserMessage);

  const [isRecording, setIsRecording] = useState(false);

  // ⏱️ INTERVIEW TIMER (starts immediately)
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ⏱️ format mm:ss
  const formatTime = (sec) => {
    const mins = String(Math.floor(sec / 60)).padStart(2, "0");
    const secs = String(sec % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleStart = () => {
    startRecording();
    setIsRecording(true);
  };

  const handleStop = () => {
    stopRecording();
    setIsRecording(false);
  };

  return (
    <div className="h-screen flex flex-col">

      {/* STATUS BAR */}
      <StatusBar />

      {/* 🎤 CONTROL + TIMER */}
      <div className="p-2 text-center flex gap-6 justify-center items-center">

        <button
          onClick={handleStart}
          className="bg-green-500 px-4 py-2 rounded"
        >
          🎤 Start Talking
        </button>

        <button
          onClick={handleStop}
          className="bg-yellow-500 px-4 py-2 rounded"
        >
          ⏹ Stop Talking
        </button>

        {/* 🔴 MIC STATUS */}
        {isRecording && (
          <div className="flex items-center gap-2 text-red-500 font-bold">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            MIC ON
          </div>
        )}

        {/* ⏱️ INTERVIEW TIMER */}
        <div className="text-white font-mono text-lg">
          ⏱️ Interview: {formatTime(seconds)}
        </div>

      </div>

      <div className="flex flex-1">

        {/* LEFT - VIDEO */}
        <div className="w-1/2 p-4 relative">
          <VideoPanel />

          {/* 🔴 LIVE badge */}
          {isRecording && (
            <div className="absolute top-4 right-4 bg-red-600 px-2 py-1 rounded text-sm animate-pulse">
              LIVE
            </div>
          )}
        </div>

        {/* CENTER - CHAT */}
        <div className="w-1/4 p-4">
          <TranscriptPanel messages={messages} />
        </div>

        {/* RIGHT - DATA PANEL */}
        <div className="w-1/4 p-4 bg-[#112b3c] rounded-lg">
          <h2 className="text-xl mb-4">Live Analysis</h2>

          <p>Income: ₹{data.income || 0}/month</p>
          <p>Employment: {data.employment || "—"}</p>
          <p>Loan Purpose: {data.loan_purpose || "—"}</p>
          <p>Loan Amount: ₹{data.loan_amount || 0}</p>

          <pre className="text-xs mt-4 bg-black p-2 rounded">
            {JSON.stringify(data, null, 2)}
          </pre>

          <div className="mt-6">
            <TrustMeter score={70} />
          </div>

          <button
            onClick={onEnd}
            className="mt-6 bg-red-500 px-4 py-2 rounded"
          >
            End Call
          </button>
        </div>

      </div>
    </div>
  );
}