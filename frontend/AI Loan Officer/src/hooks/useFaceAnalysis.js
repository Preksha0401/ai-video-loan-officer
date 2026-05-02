import { useEffect, useState } from "react";

export default function useFaceAnalysis(sessionId, videoRef) {
  const [faceData, setFaceData] = useState(null);

  useEffect(() => {
    console.log("🧠 Face hook started");

    const interval = setInterval(async () => {
      const video = videoRef.current;

      if (!video) {
        console.warn("⚠️ videoRef not ready");
        return;
      }

      if (video.readyState !== 4) {
        console.warn("⏳ Video not ready");
        return;
      }

      console.log("🎥 Capturing frame");

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const base64 = canvas.toDataURL("image/jpeg");

      try {
        console.log("📤 Sending request...");

        const res = await fetch("http://localhost:8000/face/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            image_base64: base64,
            challenge: "blink",
          }),
        });

        console.log("📡 Status:", res.status);

        const data = await res.json();

        console.log("📥 Response:", data);

        setFaceData(data);
        // AFTER setFaceData(data)

await fetch("http://localhost:8000/trust/update", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    session_id: sessionId,
    signal_type: "face_match",
    value: data.confidence || 0
  })
});

// LIVENESS SIGNAL
if (!data.liveness_passed) {
  await fetch("http://localhost:8000/trust/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      signal_type: "liveness_failed",
      value: 1
    })
  });
}

      } catch (err) {
        console.error("❌ API error:", err);
      }

    }, 4000);

    return () => clearInterval(interval);
  }, [sessionId, videoRef]);

  return { faceData };
}