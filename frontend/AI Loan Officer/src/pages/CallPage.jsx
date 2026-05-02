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

export default function CallPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const trust = useTrustScore(sessionId);
  const { messages, handleUserMessage, data } = useInterview(sessionId);
  const { startRecording, stopRecording } = useSTT(handleUserMessage);

  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // 🎥 SHARED VIDEO REF
  const videoRef = useRef(null);

  // 🧠 FACE ANALYSIS
  const { faceData } = useFaceAnalysis(sessionId, videoRef);

  // 🧠 Smooth face detection (no flicker)
const [stableFaceData, setStableFaceData] = useState(null);

useEffect(() => {
  if (faceData?.face_detected) {
    setStableFaceData(faceData);
  }
}, [faceData]);

 useEffect(() => {
  if (trust.score < 50) {
    document.body.classList.add("border-red-500");
    setTimeout(() => {
      document.body.classList.remove("border-red-500");
    }, 1000);
  }
}, [trust.score]);

  const formatTime = (sec) => {
    const mins = String(Math.floor(sec / 60)).padStart(2, "0");
    const secs = String(sec % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleStart = () => { startRecording(); setIsRecording(true); };
  const handleStop = () => { stopRecording(); setIsRecording(false); };
  const handleEndCall = async () => {
  try {
    const res = await fetch("http://localhost:8000/decision/evaluate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session_id: sessionId }),
    });

    const result = await res.json();

    // navigate with result
    navigate(`/decision/${sessionId}`, { state: result });

  } catch (err) {
    console.error("Decision error:", err);
    alert("Failed to evaluate loan decision");
  }
};

  return (
    <div className="h-screen flex flex-col bg-[#0f1923] text-white overflow-hidden">

      {/* TOP NAV */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#141f2b] border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700" />
          <span className="text-sm font-semibold">TenzorX AI Loan Interview</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          {isRecording && (
            <div className="flex items-center gap-1 text-red-400">
              ● RECORDING
            </div>
          )}
          ⏱ {formatTime(seconds)}
          ID: {sessionId?.slice(0, 8)}…
        </div>

        {!showEndConfirm ? (
  <button
    onClick={() => setShowEndConfirm(true)}
    className="bg-red-600 px-4 py-1.5 rounded"
  >
    End Call
  </button>
) : (
  <div className="flex gap-2">
    <button
      onClick={handleEndCall}
      className="bg-red-600 px-3 py-1 rounded"
    >
      Yes End
    </button>
    <button
      onClick={() => setShowEndConfirm(false)}
      className="bg-gray-600 px-3 py-1 rounded"
    >
      Cancel
    </button>
  </div>
)}
      </div>

      <StatusBar />

      {/* MAIN */}
      <div className="flex flex-1">

        {/* 🎥 VIDEO + FACE */}
        <div className="w-[48%] p-4 flex flex-col">
          <div className="relative flex-1 rounded-xl overflow-hidden">

            <VideoPanel
  videoRef={videoRef}
  faceData={stableFaceData}
/>
            {/* FACE STATUS */}
            <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded text-xs">
              Face: {stableFaceData?.face_detected ? "✅" : "❌"}
              <br />
              Emotion: {stableFaceData?.dominant_emotion || "—"}
            </div>

            {isRecording && (
              <div className="absolute top-3 left-3 bg-red-600 px-2 py-1 text-xs rounded animate-pulse">
                LIVE
              </div>
            )}
          </div>

          {/* MIC */}
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={handleStart}
              disabled={isRecording}
              className="bg-emerald-600 px-5 py-2 rounded"
            >
              Start Speaking
            </button>
            <button
              onClick={handleStop}
              disabled={!isRecording}
              className="bg-amber-600 px-5 py-2 rounded"
            >
              Stop
            </button>
          </div>
        </div>

        {/* 💬 TRANSCRIPT */}
        <div className="w-[28%] p-4 flex flex-col">
          <div className="text-xs text-gray-500 mb-2">Transcript</div>
          <div className="flex-1 bg-[#141f2b] rounded">
            <TranscriptPanel messages={messages} />
          </div>
        </div>

        {/* 📊 ANALYSIS */}
        <div className="w-[24%] p-4 flex flex-col gap-4">

          <div className="bg-[#141f2b] p-4 rounded">
           <TrustMeter score={trust.score} />
           <div className="bg-[#141f2b] p-3 rounded text-xs">
  {trust?.explanation.map((e, i) => (
    <div key={i}>{e}</div>
  ))}
</div>
          </div>

          {/* INTERVIEW DATA */}
          <div className="bg-[#141f2b] p-4 rounded text-xs space-y-2">
            <div>Income: {data.income || "—"}</div>
            <div>Employment: {data.employment || "—"}</div>
            <div>Loan Purpose: {data.loan_purpose || "—"}</div>
            <div>Amount: {data.loan_amount || "—"}</div>
          </div>

          {/* FACE DEBUG */}
          <pre className="text-xs bg-[#141f2b] p-3 rounded overflow-auto max-h-40">
            {JSON.stringify(stableFaceData, null, 2)}
          </pre>

        </div>
      </div>
    </div>
  );
}