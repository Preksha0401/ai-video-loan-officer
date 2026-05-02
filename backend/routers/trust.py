from fastapi import APIRouter
from pydantic import BaseModel
from services.trust_engine import TrustEngine
from routers.session import sessions   # 🔥 ADD THIS

router = APIRouter(prefix="/trust", tags=["trust"])

engines = {}

class TrustRequest(BaseModel):
    session_id: str
    signal_type: str
    value: float


@router.post("/update")
def update_trust(req: TrustRequest):
    if req.session_id not in engines:
        engines[req.session_id] = TrustEngine()

    engine = engines[req.session_id]

    score = engine.update(req.signal_type, req.value)

    # ✅ SAVE INTO SESSION (CRITICAL FIX)
    if req.session_id in sessions:
        sessions[req.session_id]["trust_score"] = score
    print("\n--- TRUST UPDATE ---")
    print("Session:", req.session_id)
    print("Signal:", req.signal_type)
    print("Value:", req.value)
    print("New Score:", score)
    print("--------------------\n")
    return {
        "score": score,
        "band": engine.get_band(),
        "explanation": engine.get_explanation(),
        "history": engine.history
    }


@router.get("/{session_id}")
def get_trust(session_id: str):
    engine = engines.get(session_id)

    if not engine:
        return {
            "score": 100,
            "band": "APPROVE",
            "explanation": []
        }

    return {
        "score": engine.score,
        "band": engine.get_band(),
        "explanation": engine.get_explanation()
    }