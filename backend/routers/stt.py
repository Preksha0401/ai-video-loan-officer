from fastapi import APIRouter, UploadFile, File
from services.stt_service import transcribe_audio

router = APIRouter()

@router.post("/stt/transcribe")
def transcribe(file: UploadFile = File(...)):
    return transcribe_audio(file)