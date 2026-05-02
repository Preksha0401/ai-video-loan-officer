import { useEffect, useState } from "react";

export default function useTrustScore(sessionId) {
  const [trust, setTrust] = useState({
    score: 100,
    band: "APPROVE",
    explanation: []
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`http://localhost:8000/trust/${sessionId}`);
      const data = await res.json();
      setTrust(data);
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  return trust;
}