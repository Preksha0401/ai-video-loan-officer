from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid
from services.email_service import send_email

router = APIRouter(prefix="/session", tags=["session"])

# In-memory store (replace with DB in production)
sessions: dict = {}

# In-memory store
sessions: dict = {}

def update_session_data(session_id, extracted_data):
    if session_id in sessions:
        sessions[session_id].update(extracted_data)


class SessionCreateRequest(BaseModel):
    customer_name: str
    loan_type: str
    email: str
    id_image: str | None = None   # 🔥 NEW

class SessionData(BaseModel):
    session_id: str
    customer_name: str
    loan_type: str
    email: str
    session_link: str
    id_image: str | None = None   # 🔥 NEW
    status: str = "pending"


@router.post("/start")
async def start_session(body: SessionCreateRequest):
    session_id = str(uuid.uuid4())
    session_link = f"http://localhost:5173/call/{session_id}"

    session = SessionData(
    session_id=session_id,
    customer_name=body.customer_name,
    loan_type=body.loan_type,
    email=body.email,
    session_link=session_link,
    id_image=body.id_image,   # 🔥 STORE IMAGE
)

    sessions[session_id] = session.dict()

    # Send email with verification link
    try:
        await send_email(
            recipient_email=body.email,
            session_link=session_link,
            customer_name=body.customer_name,
            loan_type=body.loan_type,
        )
    except Exception as e:
        # Log but don't fail — demo can still continue
        print(f"[email_service] Warning: failed to send email — {e}")

    return {"session_id": session_id, "session_link": session_link}


@router.get("/{session_id}")
async def get_session(session_id: str):
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session