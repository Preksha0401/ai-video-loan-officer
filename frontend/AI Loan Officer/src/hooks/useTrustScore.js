import { useEffect, useState } from "react";

export default function useTrustScore(sessionId) {
  const [trust, setTrust] = useState({
    score: 100,
    explanation: [],
  });

  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/trust/${sessionId}`
        );

        const data = await res.json();

        console.log("📊 Trust:", data);

        setTrust({
          score: data.score || 100,
          explanation: data.explanation || [],
        });

      } catch (err) {
        console.error("❌ Trust fetch error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  return trust;
}