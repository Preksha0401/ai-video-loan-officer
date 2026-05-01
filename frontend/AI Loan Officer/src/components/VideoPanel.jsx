import { useEffect, useRef } from "react";

export default function VideoPanel() {
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      });
  }, []);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      
      <video ref={videoRef} autoPlay className="w-full h-full" />

      {/* LIVE badge */}
      <div className="absolute top-2 right-2 flex items-center gap-1 text-red-500">
        <span className="animate-ping w-2 h-2 bg-red-500 rounded-full"></span>
        LIVE
      </div>

      {/* Fake Face Box */}
      <div className="absolute top-20 left-20 w-40 h-40 border-2 border-green-400">
        <p className="text-green-400 text-sm mt-44">Face: 94%</p>
      </div>

    </div>
  );
}