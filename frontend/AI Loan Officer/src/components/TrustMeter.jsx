import { useEffect, useState } from "react";

export default function TrustMeter({ score }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      if (i >= score) clearInterval(interval);
      setDisplayScore(i);
    }, 10);
  }, [score]);

  const angle = (displayScore / 100) * 180;

  return (
    <div className="text-center">
      <svg viewBox="0 0 200 100" className="w-full">
        <path d="M10 100 A90 90 0 0 1 190 100" stroke="gray" strokeWidth="10" fill="none" />
        
        <line
          x1="100"
          y1="100"
          x2={100 + 80 * Math.cos(Math.PI - (angle * Math.PI) / 180)}
          y2={100 - 80 * Math.sin(Math.PI - (angle * Math.PI) / 180)}
          stroke="white"
          strokeWidth="4"
        />
      </svg>

      <p className="mt-2 text-lg">{displayScore} / 100</p>
    </div>
  );
}