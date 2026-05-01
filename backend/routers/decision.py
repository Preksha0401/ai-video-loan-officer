from fastapi import APIRouter

router = APIRouter()

@router.get("/decision")
def decision_placeholder():
    return {"message": "Decision logic coming soon"}