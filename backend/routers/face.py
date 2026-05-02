from fastapi import APIRouter
from pydantic import BaseModel
from routers.session import sessions
from services.face_service import process_face
from routers.trust import engines

router = APIRouter(prefix="/face", tags=["face"])


class FaceRequest(BaseModel):
    session_id: str
    image_base64: str
    challenge: str | None = None


@router.post("/analyze")
def analyze_face(req: FaceRequest):
    session = sessions.get(req.session_id)

    if not session:
        return {"error": "Session not found"}

    result = process_face(session, req.image_base64, req.challenge)
    engine = engines.get(req.session_id)

    if engine:
        if not result["face_match"]:
            engine.update("face_match", 0.5)

        if not result["liveness_passed"]:
            engine.update("liveness_failed", 1)
    return result