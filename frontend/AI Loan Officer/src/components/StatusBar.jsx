export default function StatusBar() {
  return (
    <div className="bg-[#06121d] p-3 flex justify-center gap-6 text-green-400">
      <span>Face Verified ✅</span>
      <span>Liveness Detected ✅</span>
      <span>Audio Captured ✅</span>
    </div>
  );
}