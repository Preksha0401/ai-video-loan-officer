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
   const [selectedOffer, setSelectedOffer] = useState(null);
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
               {result?.decision || "PROCESSING"}
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
            {result?.explanation && (
  <div className="bg-white border rounded-2xl p-6 mb-6">
    <h2 className="font-semibold text-gray-900 mb-4">
      Why was this approved?
    </h2>

    <div className="space-y-3">
      {result.explanation.map((e, i) => (
        <div
          key={i}
          className="flex items-start gap-2 bg-green-50 border border-green-200 p-3 rounded-lg"
        >
          <span>✔</span>
          <span className="text-sm text-gray-700">{e}</span>
        </div>
      ))}
    </div>
  </div>
)}
<div className="bg-white border rounded-2xl p-6 mb-6">
  <h2 className="font-semibold text-gray-900 mb-4">
    Behavioral Signals
  </h2>

  <div className="space-y-2 text-sm">
    <div>✔ Face verified</div>
    <div>✔ Liveness check passed</div>
    <div>✔ Consistent answers</div>
    <div>⚠ Minor hesitation detected</div>
  </div>
</div>
            {result?.offer && result.decision === "APPROVED" && (
  <div className="bg-white border rounded-2xl p-6 mb-6">
    <h2 className="font-semibold text-gray-900 mb-4">
      Loan Offer
    </h2>

    <div className="text-sm text-gray-600 mb-2">
      Approved Amount: ₹{result.offer.approved_amount}
    </div>

    <div className="text-sm text-gray-600 mb-4">
      Interest Rate: {result.offer.interest_rate}% p.a.
    </div>

    <div className="space-y-3">
      {result.offer.offers.map((o, i) => (
  <div
    key={i}
    onClick={() => setSelectedOffer(o)}
    className={`border rounded-lg p-3 flex justify-between cursor-pointer ${
      selectedOffer?.tenure === o.tenure
        ? "border-blue-500 bg-blue-50"
        : ""
    }`}
  >
    <div>
      <div>{o.tenure} months</div>
      <div className="text-xs">Total ₹{o.total_payment}</div>
    </div>

    <div className="text-blue-600 font-bold">
      ₹{o.emi}/mo
    </div>
  </div>
))}
    </div>
  </div>
)}{/* CTA */}
<div className="flex flex-col gap-3">
  <div className="flex gap-3">
    <button
      onClick={async () => {
        if (!selectedOffer) {
          alert("Please select an EMI option");
          return;
        }

        const payload = {
          session_id: sessionId,
          name: result.session_data.customer_name,
          amount: result.offer.approved_amount,
          rate: result.offer.interest_rate,
          tenure: selectedOffer.tenure,
          emi: selectedOffer.emi,
          total: selectedOffer.total_payment
        };

        const res = await fetch("http://localhost:8000/offer/pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "loan_offer.pdf";
        a.click();

        window.URL.revokeObjectURL(url);
      }}
      className="flex-1 bg-blue-600 text-white py-3 rounded-xl"
    >
      Accept & Download Offer
    </button>

    <button
      onClick={() => navigate("/")}
      className="px-6 py-3 border rounded-xl"
    >
      Exit
    </button>
  </div>

  {/* NEW BUTTON */}
  <button
    onClick={() =>
      window.open("https://poonawallafincorp.com/", "_blank")
    }
    className="w-full border border-blue-600 text-blue-600 py-3 rounded-xl hover:bg-blue-50 transition"
  >
    Explore More Loan Offers →
  </button>
</div>
          </div>
        )}
      </div>
    </div>
  );
}