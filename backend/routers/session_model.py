from pydantic import BaseModel

class SessionData(BaseModel):
    customer_name: str
    loan_type: str
    email: str