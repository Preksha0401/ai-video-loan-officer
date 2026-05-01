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

  return (
    <div className="h-screen flex flex-col">

      {/* STATUS BAR */}
      <StatusBar />

      {/* START BUTTON */}
      <div className="p-2 text-center flex gap-4 justify-center">
  <button
    onClick={startRecording}
    className="bg-green-500 px-4 py-2 rounded"
  >
    🎤 Start Talking
  </button>

  <button
    onClick={stopRecording}
    className="bg-yellow-500 px-4 py-2 rounded"
  >
    ⏹ Stop Talking
  </button>
</div>

      <div className="flex flex-1">

        {/* LEFT - VIDEO */}
        <div className="w-1/2 p-4">
          <VideoPanel />
        </div>

        {/* CENTER - CHAT */}
        <div className="w-1/4 p-4">
          <TranscriptPanel messages={messages} />
        </div>

        {/* RIGHT - DATA PANEL */}
        <div className="w-1/4 p-4 bg-[#112b3c] rounded-lg">
          <h2 className="text-xl mb-4">Live Analysis</h2>

          <p className="transition-all duration-300 hover:text-yellow-300">
            Income: ₹{data.income || 0}/month
          </p>

          <p className="transition-all duration-300 hover:text-yellow-300">
            Employment: {data.employment || "—"}
          </p>

          <p className="transition-all duration-300 hover:text-yellow-300">
            Loan Purpose: {data.loan_purpose || "—"}
          </p>

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