import { useState, useRef } from "react";
import { sendMessage } from "../services/interviewService";

export default function useInterview(sessionId) {
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [data, setData] = useState({});

  // keep previous income across renders
  const prevIncomeRef = useRef(null);

  const postSignal = async (signal_type, value) => {
    try {
      await fetch("http://localhost:8000/trust/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          signal_type,
          value,
        }),
      });
    } catch (e) {
      console.warn("Trust update failed:", e);
    }
  };

  const handleUserMessage = async (text) => {
    console.log("👤 User said:", text);

    const res = await sendMessage(sessionId, text, history);
    console.log("🤖 AI response:", res);

    // 1) Update UI
    setMessages((prev) => [
      ...prev,
      { speaker: "User", text },
      { speaker: "AI", text: res.ai_reply },
    ]);

    const newHistory = [
      ...history,
      { role: "user", content: text },
      { role: "assistant", content: res.ai_reply },
    ];
    setHistory(newHistory);

    const newData = res.extracted_data || {};
    setData(newData);

    // 2) 🔥 Send TRUST signals

    // (a) Hesitation (simulate response latency)
    const latency = Math.random() * 7;
    await postSignal("hesitation", latency);

    // (b) Income inconsistency
    const prevIncome = prevIncomeRef.current;
    const currIncome = newData.income;

    if (prevIncome && currIncome) {
      const change = Math.abs(currIncome - prevIncome) / prevIncome;

      if (change > 0.3) {
        await postSignal("income_inconsistency", change);
      } else {
        await postSignal("consistent_answers", 1);
      }
    }

    // update ref for next turn
    if (currIncome) {
      prevIncomeRef.current = currIncome;
    }
  };

  return { messages, handleUserMessage, data };
}