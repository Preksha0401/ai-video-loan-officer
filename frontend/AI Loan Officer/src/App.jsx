import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ApplyPage from "./pages/ApplyPage";
import CallPage from "./pages/CallPage";
import DecisionPage from "./pages/DecisionPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/call/:sessionId" element={<CallPage />} />
        <Route path="/decision/:sessionId" element={<DecisionPage />} />
      </Routes>
    </BrowserRouter>
  );
}