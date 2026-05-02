# Updated code
from fastapi import APIRouter
from services.ai_interviewer import generate_ai_reply, extract_data
from routers.session import update_session_data

router = APIRouter()

@router.post("/interview/respond")
def respond(data: dict):
    session_id = data["session_id"]
    user_message = data["user_message"]
    history = data.get("conversation_history", [])

    print("\n========================")
    print("👤 User message:", user_message)
    print("📜 Incoming history:", history)

    extracted_before = extract_data(history)
    print("📊 Extracted BEFORE:", extracted_before)

    ai_reply = generate_ai_reply(user_message, history, extracted_before)

    updated_history = history + [
        {"role": "user", "content": user_message},
        {"role": "assistant", "content": ai_reply}
    ]

    extracted_after = extract_data(updated_history)
    update_session_data(session_id, extracted_after)

    print("📊 Extracted AFTER:", extracted_after)
    print("========================\n")

    return {
        "ai_reply": ai_reply,
        "extracted_data": extracted_after
    }