from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import session, transcript, decision

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session.router)
app.include_router(transcript.router)
app.include_router(decision.router)
from routers import interview, stt

app.include_router(interview.router)
