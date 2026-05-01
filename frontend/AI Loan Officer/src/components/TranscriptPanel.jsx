import { useEffect, useRef, useState } from "react";

export default function TranscriptPanel({ messages = [] }) {
  return (
    <div className="h-full overflow-y-auto bg-[#112b3c] p-4 rounded-lg">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`mb-2 p-2 rounded ${
            msg.speaker === "AI"
              ? "bg-blue-600 text-white"
              : "bg-gray-600"
          }`}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}