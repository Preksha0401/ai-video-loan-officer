import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* NAV */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-lg tracking-tight">TenzorX</span>
          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-2 py-0.5 ml-1">2026</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <a href="#" className="hover:text-gray-900 transition-colors">Products</a>
          <a href="#" className="hover:text-gray-900 transition-colors">About</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
          <button
            onClick={() => navigate("/apply")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Apply Now
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="max-w-6xl mx-auto px-8 pt-20 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            AI-Powered Loan Officer — Live
          </span>
        </div>

        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6 max-w-3xl">
          Get Pre-Approved in
          <span className="text-blue-600"> Minutes</span>,<br />
          Not Days
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mb-10 leading-relaxed">
          Our AI Video Loan Officer conducts a real-time interview, analyzes your profile, and delivers an instant loan decision — no paperwork, no branch visits.
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/apply")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5"
          >
            Start Loan Application →
          </button>
          <button className="text-gray-600 hover:text-gray-900 px-4 py-3 text-sm font-medium transition-colors">
            Watch Demo ▶
          </button>
        </div>

        {/* TRUST BADGES */}
        <div className="flex items-center gap-8 mt-12 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            RBI Compliant
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            256-bit Encrypted
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Instant Decision
          </div>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-8 grid grid-cols-4 divide-x divide-gray-200">
          {[
            { value: "₹500Cr+", label: "Loans Disbursed" },
            { value: "12,000+", label: "Customers Served" },
            { value: "4 min", label: "Avg. Decision Time" },
            { value: "98.2%", label: "Satisfaction Rate" },
          ].map((stat) => (
            <div key={stat.label} className="px-8 first:pl-0 last:pr-0">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="max-w-6xl mx-auto px-8 py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-10">How It Works</h2>
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Fill Application",
              desc: "Enter your basic details. Takes less than 2 minutes.",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
            },
            {
              step: "02",
              title: "AI Video Interview",
              desc: "Speak directly with our AI Loan Officer. Your responses are analyzed in real-time.",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ),
            },
            {
              step: "03",
              title: "Instant Decision",
              desc: "Get your pre-approval result, loan amount, and EMI breakdown immediately.",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
          ].map((item) => (
            <div key={item.step} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-3xl font-bold text-gray-100">{item.step}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/apply")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-xl font-semibold text-base transition-all shadow-md shadow-blue-200"
          >
            Apply for a Loan →
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white px-8 py-6 text-center text-sm text-gray-400">
        © 2026 TenzorX · AI Video Loan Officer · All rights reserved
      </footer>
    </div>
  );
}