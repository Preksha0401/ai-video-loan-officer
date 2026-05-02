import { useEffect, useRef } from "react";

export default function VideoPanel({ faceData, videoRef }) {
  const canvasRef = useRef(null);

  // ── CAMERA SETUP ──────────────────────────────────────────────
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.onloadedmetadata = () => video.play();
      })
      .catch((err) => console.error("❌ Camera error:", err));
  }, [videoRef]);

  // ── DRAW FACE BOX ─────────────────────────────────────────────
  useEffect(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");

    // Always sync canvas size to the video element's rendered size
    const syncSize = () => {
      canvas.width  = video.clientWidth  || video.offsetWidth  || 640;
      canvas.height = video.clientHeight || video.offsetHeight || 480;
    };

    syncSize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Nothing to draw
    if (!faceData?.face_detected) return;

    // Guard: backend must return face_box with x, y, w, h
    const box = faceData.face_box;
    if (
      !box ||
      box.x === undefined ||
      box.y === undefined ||
      box.w === undefined ||
      box.h === undefined
    ) {
      console.warn("⚠️ face_detected=true but face_box missing or incomplete:", box);
      return;
    }

    // Wait until the video has real dimensions
    const vW = video.videoWidth;
    const vH = video.videoHeight;
    if (!vW || !vH) {
      console.warn("⏳ Video dimensions not ready yet");
      return;
    }

    // Scale box coords (backend uses native pixel space) → rendered pixel space
    const scaleX = canvas.width  / vW;
    const scaleY = canvas.height / vH;

    const dx = box.x * scaleX;
    const dy = box.y * scaleY;
    const dw = box.w * scaleX;
    const dh = box.h * scaleY;

    // ── Outer glow ──
    ctx.shadowColor  = "rgba(0, 255, 128, 0.6)";
    ctx.shadowBlur   = 12;
    ctx.strokeStyle  = "#00FF80";
    ctx.lineWidth    = 2.5;
    ctx.strokeRect(dx, dy, dw, dh);

    // ── Corner accents ──
    ctx.shadowBlur  = 0;
    ctx.strokeStyle = "#00FF80";
    ctx.lineWidth   = 4;
    const cs = 18; // corner size

    const corners = [
      [dx,      dy,      cs,  0,  cs,  0 ],   // top-left
      [dx + dw, dy,     -cs,  0,  cs,  0 ],   // top-right
      [dx,      dy + dh, cs,  0, -cs,  0 ],   // bottom-left
      [dx + dw, dy + dh,-cs,  0, -cs,  0 ],   // bottom-right
    ];

    corners.forEach(([ox, oy, hx, hy, vx, vy]) => {
      ctx.beginPath();
      ctx.moveTo(ox + hx, oy);
      ctx.lineTo(ox, oy);
      ctx.lineTo(ox, oy + Math.sign(vy) * cs);
      ctx.stroke();
    });

    // ── Emotion label ──
    const emotion = faceData.dominant_emotion || "";
    if (emotion) {
      const label = emotion.charAt(0).toUpperCase() + emotion.slice(1);
      ctx.font         = "bold 13px 'DM Sans', system-ui, sans-serif";
      ctx.fillStyle    = "#00FF80";
      ctx.shadowColor  = "rgba(0,0,0,0.8)";
      ctx.shadowBlur   = 6;
      ctx.fillText(label, dx + 4, dy - 8);
      ctx.shadowBlur   = 0;
    }

  }, [faceData, videoRef]);

  // ── CONFIDENCE BADGE ─────────────────────────────────────────
  const confidence   = faceData?.confidence
    ? `${Math.round(faceData.confidence * 100)}%`
    : null;
  const detected     = faceData?.face_detected;
  const emotion      = faceData?.dominant_emotion || "—";

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">

      {/* Live video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Face-box canvas overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* ── Top-left: face status pill ── */}
      <div
        className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm"
        style={{
          background: detected
            ? "rgba(0,255,128,0.15)"
            : "rgba(239,68,68,0.2)",
          border: `1px solid ${detected ? "rgba(0,255,128,0.4)" : "rgba(239,68,68,0.4)"}`,
          color: detected ? "#00FF80" : "#EF4444",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: detected ? "#00FF80" : "#EF4444",
            boxShadow: detected
              ? "0 0 6px #00FF80"
              : "0 0 6px #EF4444",
          }}
        />
        {detected ? "Face Detected" : "No Face"}
      </div>

      {/* ── Bottom bar: emotion + confidence ── */}
      {detected && (
        <div
          className="absolute bottom-3 left-3 right-3 flex justify-between items-center px-3 py-1.5 rounded-xl text-xs backdrop-blur-sm"
          style={{
            background: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span style={{ color: "#CBD5E1" }}>
            😐 <span className="font-semibold text-white capitalize">{emotion}</span>
          </span>
          {confidence && (
            <span style={{ color: "#94A3B8" }}>
              Confidence:{" "}
              <span className="font-bold text-white">{confidence}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}