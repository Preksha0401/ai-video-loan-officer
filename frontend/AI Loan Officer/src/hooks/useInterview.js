import { useState } from "react";
import { sendMessage } from "../services/interviewService";

export default function useInterview(sessionId) {
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [data, setData] = useState({});

  const handleUserMessage = async (text) => {
  console.log("👤 User said:", text);

  const res = await sendMessage(sessionId, text, history);

  console.log("🤖 AI response:", res);

  setMessages(prev => [
    ...prev,
    { speaker: "User", text },
    { speaker: "AI", text: res.ai_reply }
  ]);

  setHistory(prev => [
    ...prev,
    { role: "user", content: text },
    { role: "assistant", content: res.ai_reply }
  ]);

  setData(res.extracted_data);
};

  return { messages, handleUserMessage, data };
}