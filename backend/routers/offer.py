from fastapi import APIRouter
from fastapi.responses import FileResponse
import os
from services.pdf_service import generate_offer_pdf

router = APIRouter(prefix="/offer", tags=["offer"])


@router.post("/pdf")
def generate_pdf(data: dict):
    file_path = f"offer_{data['session_id']}.pdf"

    generate_offer_pdf(data, file_path)

    return FileResponse(
        path=file_path,
        filename="loan_offer.pdf",
        media_type='application/pdf'
    )