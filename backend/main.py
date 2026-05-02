from dotenv import load_dotenv
load_dotenv()   # ✅ MUST BE FIRST

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import session, transcript, decision
from routers import interview
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import session, transcript, decision
from dotenv import load_dotenv
load_dotenv()
app = FastAPI()
from routers import session
app.include_router(session.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session.router)
app.include_router(transcript.router)
app.include_router(decision.router)
from routers import interview

app.include_router(interview.router)
from routers import face

app.include_router(face.router)
from routers import trust
app.include_router(trust.router)
from routers import offer
app.include_router(offer.router)
