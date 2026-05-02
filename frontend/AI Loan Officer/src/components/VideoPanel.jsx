import { useEffect, useRef } from "react";

export default function VideoPanel({ faceData, videoRef }) {
  const canvasRef = useRef(null);

  // 🎥 CAMERA SETUP
  useEffect(() => {
    console.log("📸 Initializing camera...");

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        console.log("✅ Camera stream received");

        const video = videoRef.current;
        video.srcObject = stream;

        video.onloadedmetadata = () => {
          console.log("📐 Video metadata loaded");
          console.log("➡️ videoWidth:", video.videoWidth);
          console.log("➡️ videoHeight:", video.videoHeight);
          video.play();
        };
      })
      .catch((err) => console.error("❌ Camera error:", err));

  }, [videoRef]);

  // 🎯 DRAW FACE BOX
  useEffect(() => {
    console.log("🧠 faceData:", faceData);

    if (!faceData || !faceData.face_detected) {
      console.warn("🚫 No face detected");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      console.warn("⚠️ Missing video/canvas");
      return;
    }

    if (!video.videoWidth) {
      console.warn("⏳ Video not ready");
      return;
    }

    const ctx = canvas.getContext("2d");

    // Match canvas to display size
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { x, y, w, h } = faceData.face_box;

    const scaleX = video.clientWidth / video.videoWidth;
    const scaleY = video.clientHeight / video.videoHeight;

    const box = {
      x: x * scaleX,
      y: y * scaleY,
      w: w * scaleX,
      h: h * scaleY,
    };

    console.log("📦 Drawing box:", box);

    ctx.strokeStyle = "lime";
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.w, box.h);

  }, [faceData, videoRef]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover rounded"
      />

      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />

      {/* STATUS */}
      <div className="absolute top-3 left-3 bg-black/70 px-3 py-1 text-sm rounded">
        Face: {faceData?.face_detected ? "✅" : "❌"}
      </div>
    </div>
  );
}