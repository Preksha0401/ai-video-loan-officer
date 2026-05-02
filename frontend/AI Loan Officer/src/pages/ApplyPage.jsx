import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LOAN_TYPES = ["Personal", "Business", "Education", "Home", "Vehicle"];

export default function ApplyPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", loanType: "Personal" });
  const [idFile, setIdFile] = useState(null); // ✅ NEW
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    return e;
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);

    try {
      const id_base64 = idFile ? await toBase64(idFile) : null;

      const res = await fetch("http://localhost:8000/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name,
          loan_type: form.loanType,
          email: form.email,
          id_image: id_base64, // ✅ NEW FIELD
        }),
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      setSubmitted(true);

      // Redirect after brief success flash
    } catch (err) {
      setErrors({ global: "Something went wrong. Please try again." });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* NAV */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors">TenzorX</span>
        </button>
        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-sm text-gray-500">Loan Application</span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {/* PROGRESS INDICATOR */}
          <div className="flex items-center gap-2 mb-8">
            {["Application", "Video Interview", "Decision"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-medium ${i === 0 ? "text-blue-600" : "text-gray-400"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${i === 0 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                    {i + 1}
                  </div>
                  {step}
                </div>
                {i < 2 && <div className={`flex-1 h-px w-10 ${i === 0 ? "bg-blue-200" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          {/* CARD */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-7 py-5">
              <h1 className="text-xl font-bold text-white">Loan Application</h1>
              <p className="text-blue-200 text-sm mt-1">Fill in your details to begin the AI interview</p>
            </div>

            {submitted ? (
              <div className="px-7 py-12 text-center">
                <div className="w-14 h-14 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Application Submitted!</h2>
                <p className="text-gray-500 text-sm">Verification link sent to <strong>{form.email}</strong></p>
                <p className="text-gray-400 text-xs mt-3">
  Please check your email and click the link to start your interview.
</p>
                <div className="mt-4 flex justify-center">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-7 py-6 space-y-5">

                {errors.global && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {errors.global}
                  </div>
                )}

                {/* NAME */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 text-sm bg-white placeholder-gray-400 outline-none transition-colors focus:ring-2 focus:ring-blue-100 ${errors.name ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-blue-400"}`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. rahul@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-lg border text-gray-900 text-sm bg-white placeholder-gray-400 outline-none transition-colors focus:ring-2 focus:ring-blue-100 ${errors.email ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-blue-400"}`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  <p className="text-xs text-gray-400 mt-1">Your verification link will be sent here</p>
                </div>

                {/* LOAN TYPE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Loan Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {LOAN_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => setForm({ ...form, loanType: type })}
                        className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${form.loanType === type ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ✅ ID UPLOAD (ONLY ADDITION) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Upload Aadhaar / PAN
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setIdFile(e.target.files[0])}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  />

                  {idFile && (
                    <p className="text-green-600 text-xs mt-1">
                      ✅ {idFile.name} uploaded
                    </p>
                  )}
                </div>

                {/* SUBMIT */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-100 mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? "Sending Verification Link…" : "Start Verification →"}
                </button>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}