import { useEffect, useRef, useState } from "react";

export default function useFaceAnalysis(sessionId, videoRef) {
  const [faceData, setFaceData] = useState(null);

  const lastSentRef = useRef({ face: 0, live: 0 });

  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      const video = videoRef.current;

      // Video must be fully ready
      if (!video || video.readyState < 4) return;
      if (!video.videoWidth || !video.videoHeight) return;

      // Capture frame
      const canvas = document.createElement("canvas");
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      const base64 = canvas.toDataURL("image/jpeg", 0.8);

      try {
        const res = await fetch("http://localhost:8000/face/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            image_base64: base64,
            challenge: "blink",
          }),
        });

        if (!res.ok) {
          console.error("❌ Face API HTTP error:", res.status);
          return;
        }

        const data = await res.json();

        // ── Debug: log exactly what the backend returns ──
        console.log("📥 Face API response:", JSON.stringify(data, null, 2));

        // Warn clearly if face_box is missing
        if (data.face_detected && !data.face_box) {
          console.warn(
            "⚠️ Backend says face_detected=true but returned NO face_box!",
            "\nCheck your backend /face/analyze endpoint — it must return:",
            '\n{ "face_box": { "x": number, "y": number, "w": number, "h": number } }'
          );
        }

        // Always update faceData (even if face_detected=false so canvas clears)
        setFaceData(data);

        const now = Date.now();

        // ── Face match penalty (throttled to once per 15s) ──
        if (
          data.face_detected &&
          data.face_match === false &&
          typeof data.confidence === "number" &&
          data.confidence < 0.4 &&
          now - lastSentRef.current.face > 15000
        ) {
          lastSentRef.current.face = now;
          console.warn("⚠️ Face mismatch penalty sent");
          await fetch("http://localhost:8000/trust/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sessionId,
              signal_type: "face_match",
              value: data.confidence,
            }),
          });
        }

        // ── Liveness failure penalty (throttled to once per 15s) ──
        if (
          data.face_detected &&
          data.liveness_passed === false &&
          now - lastSentRef.current.live > 15000
        ) {
          lastSentRef.current.live = now;
          console.warn("⚠️ Liveness failure penalty sent");
          await fetch("http://localhost:8000/trust/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              session_id: sessionId,
              signal_type: "liveness_failed",
              value: 1,
            }),
          });
        }

      } catch (err) {
        console.error("❌ Face analysis error:", err);
      }

    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId, videoRef]);

  return { faceData };
}