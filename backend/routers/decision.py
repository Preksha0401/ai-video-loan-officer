from fastapi import APIRouter
from services.risk_engine import RiskEngine
from routers.session import sessions   # ✅ CORRECT IMPORT

router = APIRouter()
risk_engine = RiskEngine()


@router.post("/decision/evaluate")
def evaluate(data: dict):
    session_id = data["session_id"]

    session = sessions.get(session_id, {})

    trust_score = session.get("trust_score", 70)

    result = risk_engine.evaluate(session, trust_score)

    return {
        **result,
        "trust_score": trust_score,
        "session_data": session
    }