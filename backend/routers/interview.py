from fastapi import APIRouter
from services.ai_interviewer import generate_ai_reply, extract_data

router = APIRouter()

@router.post("/interview/respond")
def respond(data: dict):
    user_message = data["user_message"]
    history = data.get("conversation_history", [])

    extracted = extract_data(history)
    ai_reply = generate_ai_reply(user_message, history, extracted)

    updated_history = history + [
        {"role": "user", "content": user_message},
        {"role": "assistant", "content": ai_reply}
    ]

    extracted = extract_data(updated_history)

    return {
        "ai_reply": ai_reply,
        "extracted_data": extracted
    }