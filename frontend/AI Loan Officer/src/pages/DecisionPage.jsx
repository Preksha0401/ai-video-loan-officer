import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const STEPS = [
  { label: "Analyzing interview responses", duration: 900 },
  { label: "Evaluating financial profile", duration: 800 },
  { label: "Running credit assessment model", duration: 1000 },
  { label: "Generating loan offer", duration: 700 },
];

export default function DecisionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ MOVED INSIDE COMPONENT
  const result = location.state || {}; // ✅ SAFE

  const [phase, setPhase] = useState("loading");
  const [stepIndex, setStepIndex] = useState(0);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    let elapsed = 0;
    STEPS.forEach((step, i) => {
      setTimeout(() => setStepIndex(i), elapsed);
      elapsed += step.duration;
    });
    setTimeout(() => setPhase("approved"), elapsed + 400);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* NAV */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center" />
          <span className="font-semibold text-gray-900 text-lg tracking-tight">TenzorX</span>
        </div>
        <span className="text-sm text-gray-500">Loan Decision</span>
        <div className="ml-auto text-xs text-gray-400 font-mono">
          Session: {sessionId?.slice(0, 8)}…
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">

        {phase === "loading" ? (
          <div className="w-full max-w-md text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Processing Your Application
            </h2>

            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mt-6">
              {STEPS.map((step, i) => (
                <div
                  key={step.label}
                  className={`px-5 py-3 border-b ${
                    i <= stepIndex ? "opacity-100" : "opacity-30"
                  }`}
                >
                  {step.label}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl">

            {/* RESULT */}
            <div className="bg-green-50 border rounded-2xl p-6 mb-6">
              <div className="text-xs font-semibold text-green-600">
                {result?.decision || "UNKNOWN"}
              </div>

              <h1 className="text-2xl font-bold text-gray-900">
                Result
              </h1>

              <p className="text-gray-600 text-sm">
                Decision based on AI interview
              </p>
            </div>

            {/* TRUST SCORE */}
            <div className="bg-white border rounded-2xl p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                AI Trust Score
              </h2>

              <div className="text-3xl font-bold text-blue-600">
                {result?.trust_score || 0}
              </div>
            </div>

            {/* REASONS */}
            <div className="bg-white border rounded-2xl p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Reasons
              </h2>

              {(result?.reasons || []).map((r, i) => (
                <div key={i} className="text-sm text-gray-600">
                  • {r}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <button
                onClick={() => setAccepted(true)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl"
              >
                Accept
              </button>

              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 border rounded-xl"
              >
                Exit
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}