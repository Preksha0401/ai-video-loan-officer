from fastapi import APIRouter
from services.risk_engine import RiskEngine
from routers.session import sessions

router = APIRouter()
risk_engine = RiskEngine()
from services.offer_engine import OfferEngine

offer_engine = OfferEngine()
@router.post("/decision/evaluate")
def evaluate(data: dict):

    session_id = data["session_id"]

    session = sessions.get(session_id)

    if not session:
        return {"error": "Session not found"}

    from routers.trust import engines   # import engine

    engine = engines.get(session_id)

    if engine:
        trust_score = engine.score
    else:
        trust_score = session.get("trust_score", 70)
    print("\n===== DECISION DEBUG =====")
    print("Session:", session_id)
    print("Session Data:", session)
    print("Trust Score:", trust_score)
    print("=========================\n")
    result = risk_engine.evaluate(session, trust_score)

    offer = {}

    if result["decision"] == "APPROVED":
        offer = offer_engine.generate_offer(session, trust_score)

    return {
        **result,
        "trust_score": trust_score,
        "session_data": session,
        "offer": offer   # 🔥 ADD THIS
    }