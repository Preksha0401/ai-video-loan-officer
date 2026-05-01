from fastapi import APIRouter

router = APIRouter()

transcripts = []

@router.post("/transcript/chunk")
def add_chunk(data: dict):
    transcripts.append(data)
    return {"status": "stored"}