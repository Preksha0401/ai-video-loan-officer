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
    body = f"""Hi {customer_name},

We received your application for a {loan_type} loan.

To continue, please start your short verification interview here:
{session_link}

This helps us process your request faster.

Thanks,
TenzorX Team
"""

    message = MessageSchema(
        subject=f"Continue your loan application",
        recipients=[recipient_email],
        body=body,
        subtype="plain",
    )

    fm = FastMail(conf)
    await fm.send_message(message)