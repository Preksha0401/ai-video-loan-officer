import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import CallPage from "./pages/CallPage";
import DecisionPage from "./pages/DecisionPage";

export default function App() {
  const [page, setPage] = useState("landing");

  return (
    <>
      {page === "landing" && <LandingPage onStart={() => setPage("call")} />}
      {page === "call" && <CallPage onEnd={() => setPage("decision")} />}
      {page === "decision" && <DecisionPage />}
    </>
  );
}