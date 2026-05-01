from fastapi import APIRouter
from models.session_model import SessionData
import uuid
from datetime import datetime

router = APIRouter()

sessions = {}

@router.post("/session/start")
def start_session():
    session_id = str(uuid.uuid4())

    session = SessionData(
        session_id=session_id,
        created_at=datetime.utcnow()
    )

    sessions[session_id] = session
    return {"session_id": session_id}


@router.get("/session/{session_id}")
def get_session(session_id: str):
    return sessions.get(session_id, {})