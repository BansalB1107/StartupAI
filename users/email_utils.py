import logging
import random

from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)


# Generates a standard six-digit random numeric one-time password for user email verification.
def generate_otp():
    return str(random.randint(100000, 999999))


# Dispatches an HTML-formatted email containing the verification OTP to the registering user.
def send_otp_email(user, otp):

    logger.info("Attempting to send OTP email to: %s", user.email)

    subject = "Verify Your Email"

    html_content = f"""
    <h2>Hello {user.username}</h2>
    <p>Your OTP is:</p>
    <h1>{otp}</h1>
    <p>This OTP expires in 10 minutes.</p>
    <p>Team StartupAI</p>
    """

    try:
        email = EmailMultiAlternatives(
            subject,
            "",
            settings.EMAIL_HOST_USER,
            [user.email]
        )

        email.attach_alternative(html_content, "text/html")

        result = email.send()

        logger.info("OTP email sent successfully to %s (result=%s)", user.email, result)

    except Exception as e:
        logger.error("Failed to send OTP email to %s: %s", user.email, e)


# Sends a formatted welcome email introducing platform features after successful account verification.
def send_welcome_email(user):

    subject = "Welcome to StartupAI  🚀"

    html_content = f"""
    <div style="
        background:#f4f6f9;
        padding:40px;
        font-family:Arial,sans-serif;
    ">

        <div style="
            max-width:600px;
            margin:auto;
            background:white;
            padding:30px;
            border-radius:12px;
            box-shadow:0 2px 10px rgba(0,0,0,0.1);
        ">

            <h1 style="
                color:#4F46E5;
                text-align:center;
            ">
                🚀 Welcome to StartupAI
            </h1>

            <p>Hello <b>{user.username}</b>,</p>

            <p>
                Your email has been verified successfully.
            </p>

            <p>
                We're excited to have you join our platform.
            </p>

            <p>
                You can now:
            </p>

            <ul>
                <li>Create your startup profile</li>
                <li>Connect with investors</li>
                <li>Generate AI reports</li>
                <li>Grow your business</li>
            </ul>


            <hr style="margin-top:30px;">

            <p style="
                font-size:12px;
                color:gray;
                text-align:center;
            ">
                StartupAI Team<br>
                Please do not reply to this email.
            </p>

        </div>

    </div>
    """

    email = EmailMultiAlternatives(
        subject=subject,
        body="Welcome to StartupAI",
        from_email=settings.EMAIL_HOST_USER,
        to=[user.email]
    )

    email.attach_alternative(
        html_content,
        "text/html"
    )

    email.send()