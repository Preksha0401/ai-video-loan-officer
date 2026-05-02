import { useEffect, useRef, useState } from "react";

export default function TranscriptPanel({ messages = [] }) {
  const bottomRef = useRef(null);
  const [newIdx, setNewIdx] = useState(-1);

  useEffect(() => {
    if (messages.length > 0) {
      setNewIdx(messages.length - 1);
      const t = setTimeout(() => setNewIdx(-1), 600);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      return () => clearTimeout(t);
    }
  }, [messages.length]);

  return (
    <div className="h-full flex flex-col" style={{ background: "#fff" }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#E5E7EB transparent" }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
                boxShadow: "0 0 20px rgba(37,99,235,0.1)",
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                style={{ color: "#60A5FA" }} strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#9CA3AF" }}>
              Press <span className="font-semibold" style={{ color: "#2563EB" }}>Start Speaking</span>
              <br />to begin the interview
            </p>
            <div className="mt-4 flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1 h-1 rounded-full"
                  style={{ background: "#DBEAFE", animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isAI = msg.speaker === "AI";
          const isNew = i === newIdx;

          return (
            <div
              key={i}
              className={`flex flex-col gap-1.5 ${isAI ? "items-start" : "items-end"}`}
              style={{
                animation: isNew ? "bubbleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both" : "none",
              }}
            >
              {/* Speaker tag */}
              <div className="flex items-center gap-1.5 px-1">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                  style={{
                    background: isAI
                      ? "linear-gradient(135deg, #2563EB, #60A5FA)"
                      : "linear-gradient(135deg, #F59E0B, #FDE68A)",
                    boxShadow: isAI
                      ? "0 1px 6px rgba(37,99,235,0.3)"
                      : "0 1px 6px rgba(245,158,11,0.3)",
                  }}
                >
                  {isAI ? (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                    </svg>
                  )}
                </div>
                <span className="text-xs font-semibold" style={{ color: "#6B7280" }}>
                  {isAI ? "AI Officer" : "You"}
                </span>
              </div>

              {/* Bubble */}
              <div
                className="max-w-[88%] px-3.5 py-2.5 text-sm leading-relaxed"
                style={
                  isAI
                    ? {
                        background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
                        color: "#1E3A5F",
                        borderRadius: "4px 16px 16px 16px",
                        boxShadow: "0 2px 8px rgba(37,99,235,0.1), 0 1px 2px rgba(0,0,0,0.04)",
                        border: "1px solid rgba(219,234,254,0.8)",
                      }
                    : {
                        background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
                        color: "#78350F",
                        borderRadius: "16px 4px 16px 16px",
                        boxShadow: "0 2px 8px rgba(245,158,11,0.1), 0 1px 2px rgba(0,0,0,0.04)",
                        border: "1px solid rgba(253,230,138,0.8)",
                      }
                }
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <style>{`
        @keyframes bubbleIn {
          from { opacity: 0; transform: scale(0.85) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}