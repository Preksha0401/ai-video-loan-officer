import { useState, useRef } from "react";
import { sendMessage } from "../services/interviewService";

export default function useInterview(sessionId) {
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [data, setData] = useState({});

  const prevIncomeRef = useRef(null);
  const prevDataRef = useRef({});

  const handleUserMessage = async (text) => {
    console.log("👤 User:", text);

    const start = Date.now();

    try {
      const res = await sendMessage(sessionId, text, history);

      const latency = (Date.now() - start) / 1000;

      console.log("🤖 AI:", res);
      console.log("⏱ Latency:", latency);

      const newData = res.extracted_data || {};

      // -----------------------------
      // 🧠 UPDATE UI
      // -----------------------------
      setMessages((prev) => [
        ...prev,
        { speaker: "User", text },
        { speaker: "AI", text: res.ai_reply },
      ]);

      const updatedHistory = [
        ...history,
        { role: "user", content: text },
        { role: "assistant", content: res.ai_reply },
      ];

      setHistory(updatedHistory);
      setData(newData);

      // -----------------------------
      // 🟢 POSITIVE SIGNAL
      // -----------------------------
      const prevData = prevDataRef.current;

      let isGoodAnswer = false;

      // New field extracted
      if (
        (!prevData.income && newData.income) ||
        (!prevData.employment && newData.employment) ||
        (!prevData.loan_amount && newData.loan_amount) ||
        (!prevData.loan_purpose && newData.loan_purpose)
      ) {
        isGoodAnswer = true;
      }

      // Meaningful answer
      if (text && text.length > 5) {
        isGoodAnswer = true;
      }

      if (isGoodAnswer) {
        console.log("✅ Consistent answer detected");

        await fetch("http://localhost:8000/trust/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            signal_type: "consistent_answers",
            value: 1,
          }),
        });
      }

      // -----------------------------
      // 🔵 HESITATION SIGNAL
      // -----------------------------
      if (latency > 5) {
        console.log("⚠ Hesitation detected");

        await fetch("http://localhost:8000/trust/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            signal_type: "hesitation",
            value: latency,
          }),
        });
      }

      // -----------------------------
      // 🟡 INCOME INCONSISTENCY
      // -----------------------------
      const currentIncome = newData?.income;

      if (
        currentIncome &&
        prevIncomeRef.current &&
        prevIncomeRef.current > 0
      ) {
        const change =
          Math.abs(currentIncome - prevIncomeRef.current) /
          prevIncomeRef.current;

        if (change > 0.3) {
          console.log("⚠ Income inconsistency detected");

          await fetch("http://localhost:8000/trust/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sessionId,
              signal_type: "income_inconsistency",
              value: change,
            }),
          });
        }
      }

      if (currentIncome) {
        prevIncomeRef.current = currentIncome;
      }

      // -----------------------------
      // SAVE FOR NEXT STEP
      // -----------------------------
      prevDataRef.current = newData;

    } catch (err) {
      console.error("❌ Interview error:", err);
    }
  };

  return { messages, handleUserMessage, data };
}