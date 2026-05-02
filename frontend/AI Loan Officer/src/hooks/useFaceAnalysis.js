import { useEffect, useRef, useState } from "react";

export default function useFaceAnalysis(sessionId, videoRef) {
  const [faceData, setFaceData] = useState(null);

  // ⏱ throttle refs (persist across renders)
  const lastSentRef = useRef({
    face: 0,
    live: 0,
  });

  useEffect(() => {
    if (!sessionId) return;

    console.log("🧠 Face hook started");

    const interval = setInterval(async () => {
      const video = videoRef.current;

      if (!video || video.readyState !== 4) {
        return;
      }

      // 🎥 capture frame
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const base64 = canvas.toDataURL("image/jpeg");

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

       const data = await res.json();

console.log("📥 Face:", data);

// ✅ ADD THIS LINE
setFaceData(data);

       const now = Date.now();

/* =========================
   🟡 FACE MATCH (SAFE)
========================= */
// ONLY send penalty if we actually HAVE id_image
if (
  data.face_detected &&
  data.face_match === false &&
  data.confidence !== undefined &&
  data.confidence < 0.4 &&   // stricter
  now - lastSentRef.current.face > 15000 // 🔥 once every 15 sec max
) {
  lastSentRef.current.face = now;

  console.log("⚠ FACE mismatch (RARE)");

  await fetch("http://localhost:8000/trust/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      signal_type: "face_match",
      value: data.confidence
    }),
  });
}


/* =========================
   🔴 LIVENESS (SAFE)
========================= */
if (
  data.face_detected &&
  data.liveness_passed === false &&
  now - lastSentRef.current.live > 15000
)  {
  lastSentRef.current.live = now;

  console.log("⚠ Liveness failure");

  await fetch("http://localhost:8000/trust/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      signal_type: "liveness_failed",
      value: 1
    }),
  });
}

      } catch (err) {
        console.error("❌ Face API error:", err);
      }

    }, 3000); // every 3 sec

    return () => clearInterval(interval);
  }, [sessionId, videoRef]);

  return { faceData };
}