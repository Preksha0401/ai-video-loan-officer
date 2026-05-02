import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const STEPS = [
  { label: "Analyzing interview responses", duration: 900 },
  { label: "Evaluating financial profile", duration: 800 },
  { label: "Running credit assessment model", duration: 1000 },
  { label: "Generating loan offer", duration: 700 },
];

export default function DecisionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState("loading"); // loading | approved
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-lg tracking-tight">TenzorX</span>
        </div>
        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-sm text-gray-500">Loan Decision</span>
        <div className="ml-auto text-xs text-gray-400 font-mono">Session: {sessionId?.slice(0, 8)}…</div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">

        {phase === "loading" ? (
          /* ── LOADING STATE ── */
          <div className="w-full max-w-md text-center">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="w-20 h-20 rounded-full border-4 border-blue-100"></div>
              <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Your Application</h2>
            <p className="text-gray-500 text-sm mb-8">Our AI is reviewing your interview session</p>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              {STEPS.map((step, i) => (
                <div
                  key={step.label}
                  className={`flex items-center gap-3 px-5 py-3.5 border-b last:border-b-0 border-gray-100 transition-all duration-500 ${i <= stepIndex ? "opacity-100" : "opacity-30"}`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${i < stepIndex ? "bg-green-500" : i === stepIndex ? "bg-blue-600" : "bg-gray-200"}`}>
                    {i < stepIndex ? (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : i === stepIndex ? (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    )}
                  </div>
                  <span className={`text-sm ${i <= stepIndex ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                  {i === stepIndex && (
                    <span className="ml-auto text-xs text-blue-500 animate-pulse">Running…</span>
                  )}
                  {i < stepIndex && (
                    <span className="ml-auto text-xs text-green-500">Done</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── APPROVED STATE ── */
          <div className="w-full max-w-2xl animate-fadeIn">
            {/* APPROVAL BANNER */}
            <div className="bg-green-50 border border-green-200 rounded-2xl px-7 py-6 mb-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-200">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-0.5">Pre-Approved</div>
                <h1 className="text-2xl font-bold text-gray-900">Congratulations! 🎉</h1>
                <p className="text-gray-600 text-sm mt-0.5">Your loan application has been approved based on your interview assessment.</p>
              </div>
            </div>

            {/* LOAN DETAILS GRID */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <div className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-1">Approved Loan Amount</div>
                <div className="text-3xl font-bold text-gray-900">₹8,00,000</div>
                <div className="text-sm text-gray-500 mt-1">Personal Loan</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <div className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-1">Monthly EMI</div>
                <div className="text-3xl font-bold text-blue-600">₹17,000</div>
                <div className="text-sm text-gray-500 mt-1">for 60 months</div>
              </div>
            </div>

            {/* TERMS TABLE */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 text-sm">Loan Terms & Details</h2>
              </div>
              {[
                { label: "Interest Rate", value: "10.5% p.a. (reducing)" },
                { label: "Loan Tenure", value: "60 months (5 years)" },
                { label: "Processing Fee", value: "1% + GST (waived for early applicants)" },
                { label: "Prepayment Charges", value: "Nil after 12 months" },
                { label: "Disbursal Time", value: "Within 24 hours of acceptance" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-6 py-3.5 border-b last:border-b-0 border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className="text-sm font-medium text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>

            {/* AI SCORE CARD */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 text-sm">AI Trust Assessment</h2>
                <span className="text-xs text-gray-400 font-mono">Session {sessionId?.slice(0, 8)}…</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="85 15" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base font-bold text-gray-900">85</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {[
                    { label: "Communication Clarity", score: 90 },
                    { label: "Financial Consistency", score: 82 },
                    { label: "Intent Authenticity", score: 88 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{item.label}</span>
                        <span className="font-medium text-gray-700">{item.score}/100</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            {!accepted ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setAccepted(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-100"
                >
                  Accept Offer & Proceed →
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-3.5 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Decline
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-5 flex items-center gap-3">
                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <div className="font-semibold text-green-800 text-sm">Offer Accepted!</div>
                  <div className="text-green-600 text-xs mt-0.5">Our team will contact you within 24 hours for disbursal.</div>
                </div>
              </div>
            )}

            <p className="text-center text-xs text-gray-400 mt-5">
              This is a pre-approval offer valid for 7 days. Subject to final documentation.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}