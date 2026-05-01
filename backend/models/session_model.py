from pydantic import BaseModel
from datetime import datetime

class SessionData(BaseModel):
    session_id: str
    customer_name: str = ""
    loan_type: str = ""
    status: str = "active"
    created_at: datetime