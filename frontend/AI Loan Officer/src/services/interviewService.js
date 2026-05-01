const API = "http://127.0.0.1:8000";

export async function sendMessage(sessionId, userMessage, history) {
  const res = await fetch(`${API}/interview/respond`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      session_id: sessionId,
      user_message: userMessage,
      conversation_history: history
    })
  });

  return res.json();
}

export async function transcribeAudio(blob) {
  const formData = new FormData();
  formData.append("file", blob);

  const res = await fetch(`${API}/stt/transcribe`, {
    method: "POST",
    body: formData
  });

  return res.json();
}