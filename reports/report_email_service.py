"""
Report Email Service — Sends professional HTML emails with PDF attachments.
Uses existing Gmail SMTP config from settings.py.
Never calls Gemini. Uses stored report data only.
"""

import logging
import os
from datetime import datetime

from django.conf import settings
from django.core.mail import EmailMultiAlternatives

from .pdf_service import get_or_create_pdf, _sanitize_filename

logger = logging.getLogger(__name__)


# Parses and formats various date representations into a human-readable string for email display.
def _format_date(date_val):
    """Format date for email display."""
    if isinstance(date_val, str):
        try:
            parsed = datetime.fromisoformat(date_val.replace("Z", "+00:00"))
            return parsed.strftime("%B %d, %Y at %I:%M %p")
        except (ValueError, TypeError):
            return date_val
    elif isinstance(date_val, datetime):
        return date_val.strftime("%B %d, %Y at %I:%M %p")
    return str(date_val) if date_val else "N/A"


# Constructs a responsive, professionally styled HTML email template containing the startup analysis details.
def _build_email_html(startup_name, industry, created_at, username):
    """
    Build a professional responsive HTML email template.
    Matches the StartupAI brand colors.
    """
    date_str = _format_date(created_at)

    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="
        margin: 0;
        padding: 0;
        background-color: #f4f6fa;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        -webkit-font-smoothing: antialiased;
    ">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="
            background-color: #f4f6fa;
            padding: 40px 20px;
        ">
            <tr>
                <td align="center">
                    <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="
                        max-width: 600px;
                        width: 100%;
                        background-color: #ffffff;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08);
                    ">
                        <!-- Header -->
                        <tr>
                            <td style="
                                background: linear-gradient(135deg, #6366F1, #A855F7);
                                padding: 32px 40px;
                                text-align: center;
                            ">
                                <h1 style="
                                    margin: 0;
                                    color: #ffffff;
                                    font-size: 24px;
                                    font-weight: 800;
                                    letter-spacing: -0.5px;
                                ">
                                    🚀 StartupAI
                                </h1>
                                <p style="
                                    margin: 8px 0 0;
                                    color: rgba(255, 255, 255, 0.85);
                                    font-size: 13px;
                                    font-weight: 500;
                                ">
                                    AI-Powered Business Intelligence
                                </p>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding: 40px;">
                                <!-- Greeting -->
                                <p style="
                                    margin: 0 0 20px;
                                    font-size: 16px;
                                    color: #0f172a;
                                    font-weight: 600;
                                ">
                                    Hello {username} 👋
                                </p>

                                <p style="
                                    margin: 0 0 24px;
                                    font-size: 14px;
                                    color: #64748b;
                                    line-height: 1.7;
                                ">
                                    Your AI-generated startup analysis report is ready!
                                    We've attached the complete strategic report for
                                    <strong style="color: #6366F1;">{startup_name}</strong>
                                    as a professional PDF document.
                                </p>

                                <!-- Report Details Card -->
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="
                                    background-color: #f8fafc;
                                    border: 1px solid #e2e8f0;
                                    border-radius: 12px;
                                    margin-bottom: 28px;
                                ">
                                    <tr>
                                        <td style="padding: 24px;">
                                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                                <tr>
                                                    <td style="padding-bottom: 12px;">
                                                        <span style="
                                                            font-size: 11px;
                                                            font-weight: 700;
                                                            color: #6366F1;
                                                            text-transform: uppercase;
                                                            letter-spacing: 1px;
                                                        ">Report Details</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding-bottom: 10px;">
                                                        <span style="font-size: 12px; color: #94a3b8; font-weight: 600;">Startup Name</span><br>
                                                        <span style="font-size: 14px; color: #0f172a; font-weight: 700;">{startup_name}</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding-bottom: 10px;">
                                                        <span style="font-size: 12px; color: #94a3b8; font-weight: 600;">Industry</span><br>
                                                        <span style="font-size: 14px; color: #0f172a; font-weight: 700;">{industry}</span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span style="font-size: 12px; color: #94a3b8; font-weight: 600;">Generated On</span><br>
                                                        <span style="font-size: 14px; color: #0f172a; font-weight: 700;">{date_str}</span>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Attachment Notice -->
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="
                                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08));
                                    border: 1px solid rgba(99, 102, 241, 0.2);
                                    border-radius: 12px;
                                    margin-bottom: 28px;
                                ">
                                    <tr>
                                        <td style="padding: 16px 20px;">
                                            <p style="
                                                margin: 0;
                                                font-size: 13px;
                                                color: #6366F1;
                                                font-weight: 600;
                                            ">
                                                📎 Your PDF report is attached to this email.
                                            </p>
                                        </td>
                                    </tr>
                                </table>

                                <!-- CTA -->
                                <p style="
                                    margin: 0;
                                    font-size: 13px;
                                    color: #94a3b8;
                                    line-height: 1.6;
                                ">
                                    You can also view and manage all your reports from the
                                    <strong>My Reports</strong> section in your dashboard.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="
                                padding: 24px 40px;
                                background-color: #f8fafc;
                                border-top: 1px solid #e2e8f0;
                                text-align: center;
                            ">
                                <p style="
                                    margin: 0 0 4px;
                                    font-size: 12px;
                                    color: #94a3b8;
                                    font-weight: 600;
                                ">
                                    StartupAI AI
                                </p>
                                <p style="
                                    margin: 0;
                                    font-size: 11px;
                                    color: #cbd5e1;
                                ">
                                    This is an automated email. Please do not reply.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


# Dispatches an email containing the generated PDF report and detailed startup analysis information.
def send_report_email(report):
    """
    Send a professional email with the report PDF attached.

    Args:
        report: Report model instance (must have user with email)

    Returns:
        bool: True if email sent successfully, False otherwise

    Raises:
        ValueError: If user has no email address
    """
    user = report.user
    if not user or not user.email:
        raise ValueError("User has no email address")

    startup_name = report.startup_name or "Untitled Startup"
    industry = report.industry or "General"
    created_at = report.created_at
    username = user.username

    # Get or generate PDF
    pdf_relative_path = get_or_create_pdf(report)
    pdf_full_path = os.path.join(settings.MEDIA_ROOT, pdf_relative_path)

    # Build filename for attachment
    safe_name = _sanitize_filename(startup_name)
    date_str = created_at.strftime("%Y-%m-%d") if created_at else "report"
    attachment_filename = f"{safe_name}_Report_{date_str}.pdf"

    # Build email
    subject = f"📊 Your {startup_name} Analysis Report — StartupAI AI"

    html_content = _build_email_html(
        startup_name=startup_name,
        industry=industry,
        created_at=created_at,
        username=username,
    )

    plain_text = (
        f"Hello {username},\n\n"
        f"Your AI-generated startup analysis report for {startup_name} is attached.\n\n"
        f"Industry: {industry}\n"
        f"Generated: {_format_date(created_at)}\n\n"
        f"— StartupAI AI"
    )

    email = EmailMultiAlternatives(
        subject=subject,
        body=plain_text,
        from_email=settings.EMAIL_HOST_USER,
        to=[user.email],
    )

    email.attach_alternative(html_content, "text/html")

    # Attach PDF
    with open(pdf_full_path, "rb") as pdf_file:
        email.attach(attachment_filename, pdf_file.read(), "application/pdf")

    try:
        result = email.send()
        logger.info("Report email sent to %s (result=%s)", user.email, result)
        return True
    except Exception as e:
        logger.exception("Report email error for %s", user.email)
        raise
