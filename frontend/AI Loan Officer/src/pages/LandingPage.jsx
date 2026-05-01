export default function LandingPage({ onStart }) {
  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={onStart}
        className="bg-teal-500 px-6 py-3 rounded-xl text-lg hover:bg-teal-600"
      >
        Start Loan Application
      </button>
    </div>
  );
}