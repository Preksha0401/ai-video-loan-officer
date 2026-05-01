import os
import json
import requests
from dotenv import load_dotenv
import os

load_dotenv()
API_KEY = os.getenv("MISTRAL_API_KEY") 

URL = "https://api.mistral.ai/v1/chat/completions"

MODEL = "mistral-small"

SYSTEM_PROMPT = """You are an AI Loan Officer for Poonawalla Fincorp. Your job is to conduct a video loan verification interview.
You must:
1. Greet the customer warmly by name if known
2. Ask 6–8 questions to assess: monthly income, employment type, loan purpose, loan amount needed, existing EMIs, and repayment ability
3. Adapt follow-up questions based on answers
4. Keep responses short (1–2 sentences max)
5. End with: "Thank you. I have all the information I need. Please wait while I process your application."
Always respond in the same language as the user.
"""

EXTRACTION_PROMPT = """From this conversation, extract in JSON only: income (number in INR, 0 if unknown), employment (string), loan_purpose (string), loan_amount (number in INR, 0 if unknown), consent_given (boolean).
Return ONLY valid JSON.
"""


def call_mistral(messages):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": MODEL,
        "messages": messages
    }

    response = requests.post(URL, headers=headers, json=data)
    return response.json()


def generate_ai_reply(user_message, history, extracted):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += history
    messages.append({"role": "user", "content": user_message})
    print("🔑 API KEY:", API_KEY)
    response = call_mistral(messages)
    print("👤 User message:", user_message)
    print("📜 History:", history)
    try:
        print("🤖 AI reply:", response)
        return response["choices"][0]["message"]["content"]
    
    except:
        return "Could you tell me your monthly income?"


def extract_data(history):
    messages = [
        {"role": "system", "content": EXTRACTION_PROMPT},
        {"role": "user", "content": str(history)}
    ]

    response = call_mistral(messages)

    try:
        return json.loads(response["choices"][0]["message"]["content"])
    except:
        return {
            "income": 0,
            "employment": "",
            "loan_purpose": "",
            "loan_amount": 0,
            "consent_given": False
        }