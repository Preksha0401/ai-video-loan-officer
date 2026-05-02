from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from dotenv import load_dotenv
import os

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)


async def send_email(
    recipient_email: str,
    session_link: str,
    customer_name: str = "Applicant",
    loan_type: str = "Loan",
):
    body = f"""Hello {customer_name},

Thank you for applying for a {loan_type} loan through TenzorX AI Loan Officer.

Click the secure link below to begin your AI video interview:

{session_link}

This link is unique to your application and valid for 24 hours.

If you did not request this, please ignore this email.

Regards,
TenzorX AI Loan Officer
"""

    message = MessageSchema(
        subject=f"Your {loan_type} Loan Verification Link — TenzorX",
        recipients=[recipient_email],
        body=body,
        subtype="plain",
    )

    fm = FastMail(conf)
    await fm.send_message(message)