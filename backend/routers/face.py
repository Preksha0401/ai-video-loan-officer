from fastapi import APIRouter
from pydantic import BaseModel
from routers.session import sessions
from services.face_service import process_face

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

    return result