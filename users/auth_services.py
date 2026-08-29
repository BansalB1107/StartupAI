import logging
import secrets
import string
from datetime import timedelta

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone
from django.utils.crypto import constant_time_compare

logger = logging.getLogger(__name__)


# Cryptographically generates a secure, random six-digit one-time password for email verification.
def generate_secure_otp():
    """Generate a secure 6-digit OTP"""
    return "".join(secrets.choice(string.digits) for _ in range(6))

# Enforces rate limiting by restricting OTP requests to a maximum of five per hour.
def check_rate_limit(profile):
    """
    Feature 4: Rate Limiting
    Maximum 5 OTP requests per hour per email.
    """
    now = timezone.now()
    if not profile.otp_window_start or now > profile.otp_window_start + timedelta(hours=1):
        # Reset window
        profile.otp_window_start = now
        profile.otp_request_count = 1
        profile.save()
        return True, None
    
    if profile.otp_request_count >= 5:
        return False, "Too many OTP requests. Try again in one hour."
    
    profile.otp_request_count += 1
    profile.save()
    return True, None

# Prevents OTP resend spam by enforcing a mandatory sixty-second cooldown between consecutive requests.
def can_resend_otp(profile):
    """
    Feature 2: Resend OTP Timer
    Reject resend requests before 60 seconds.
    """
    now = timezone.now()
    if profile.last_otp_sent_at and now < profile.last_otp_sent_at + timedelta(seconds=60):
        return False, "Please wait before requesting another OTP."
    return True, None

# Inactivates old OTPs, generates a fresh token, resets attempts, and updates generation timestamps.
def setup_new_otp(profile):
    """
    Feature 5: OTP Invalidation
    Whenever a new OTP is generated:
    - Delete/overwrite previous OTP
    - Reset attempts
    - Reset timer
    - Store new timestamp
    """
    otp = generate_secure_otp()
    profile.email_otp = otp
    profile.otp_attempts = 0
    profile.otp_created_at = timezone.now()
    profile.last_otp_sent_at = timezone.now()
    profile.save()
    return otp

# Securely validates user OTP input, checks expiration time, and strictly limits failure attempts.
def validate_otp(profile, otp_input):
    """
    Feature 1: OTP Expiry (5 minutes)
    Feature 3: Max wrong attempts (3 wrong attempts -> invalidate OTP)
    Feature 8: Timing-safe OTP comparison
    """
    if not profile.email_otp or not profile.otp_created_at:
        return False, "OTP expired. Please request a new OTP."
    
    now = timezone.now()
    
    # 1. Check expiration
    if now > profile.otp_created_at + timedelta(minutes=5):
        # Invalidate OTP on expiry
        profile.email_otp = None
        profile.otp_attempts = 0
        profile.save()
        return False, "OTP expired. Please request a new OTP."
    
    # 2. Timing-safe comparison
    is_match = constant_time_compare(str(profile.email_otp), str(otp_input))
    
    if not is_match:
        profile.otp_attempts += 1
        profile.save()
        
        # Check max attempts limit
        if profile.otp_attempts >= 3:
            profile.email_otp = None
            profile.otp_attempts = 0
            profile.save()
            return False, "Maximum OTP attempts reached. Request a new OTP."
        
        return False, "Invalid OTP"
    
    # Validation succeeded, clean up
    profile.email_otp = None
    profile.otp_attempts = 0
    profile.save()
    return True, None

# Extracts the authentic client IP address from request headers, accounting for proxies.
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

# Parses the HTTP User-Agent string to identify the client's web browser accurately.
def get_client_browser(request):
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    if not user_agent:
        return 'Unknown'
    
    ua = user_agent.lower()
    if 'chrome' in ua or 'crios' in ua:
        if 'edg' in ua:
            return 'Microsoft Edge'
        if 'opr' in ua:
            return 'Opera'
        return 'Google Chrome'
    elif 'safari' in ua:
        return 'Apple Safari'
    elif 'firefox' in ua or 'fxios' in ua:
        return 'Mozilla Firefox'
    elif 'msie' in ua or 'trident' in ua:
        return 'Internet Explorer'
    return user_agent

# Dispatches an automated security alert email to the user upon a successful account login.
def send_login_alert_email(user, request):
    """
    Feature 6: Login Alert Email
    Send professional HTML email after successful login.
    """
    browser = get_client_browser(request)
    
    # Use timezone.localtime to convert to the project's TIME_ZONE (Asia/Kolkata)
    login_time = timezone.localtime(timezone.now()).strftime("%B %d, %Y, %I:%M %p IST")
    
    subject = "New Login Alert - StartupAI"
    
    text_content = f"""New Login Alert - StartupAI

Hello {user.username},

We detected a new sign-in to your StartupAI account.

Username       : {user.username}
Date & Time    : {login_time}
Browser        : {browser}

If this activity was initiated by you, no further action is required.

If you do not recognize this login, please change your password immediately and review your account security settings.

Thank you,
StartupAI Security Team"""
    
    html_content = f"""
    <div style="background-color: #f6f9fc; padding: 40px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e1e8ed;">
            <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Security Notification</h1>
            </div>
            <div style="padding: 40px 30px; color: #1f2937;">
                <p style="font-size: 16px; line-height: 24px; margin-top: 0; margin-bottom: 20px; color: #374151;">
                    Hello <strong>{user.username}</strong>,
                </p>
                <p style="font-size: 15px; line-height: 24px; color: #4b5563; margin-bottom: 30px;">
                    We detected a new sign-in to your StartupAI account. To keep your account secure, please verify the details of this activity below:
                </p>
                
                <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; border: 1px solid #f3f4f6; margin-bottom: 30px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-size: 14px; color: #6b7280; width: 35%;"><strong>Username:</strong></td>
                            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 500;">{user.username}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-size: 14px; color: #6b7280;"><strong>Date & Time:</strong></td>
                            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 500;">{login_time}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-size: 14px; color: #6b7280;"><strong>Browser:</strong></td>
                            <td style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 500;">{browser}</td>
                        </tr>
                    </table>
                </div>
                
                <div style="border-left: 4px solid #ef4444; background-color: #fef2f2; padding: 15px; border-radius: 4px; margin-bottom: 30px;">
                    <p style="margin: 0; font-size: 14px; color: #991b1b; line-height: 20px; margin-bottom: 10px;">
                        If this activity was initiated by you, no further action is required.
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #991b1b; line-height: 20px;">
                        If you do not recognize this login, please change your password immediately and review your account security settings.
                    </p>
                </div>
                
                <p style="font-size: 15px; line-height: 24px; color: #4b5563; margin-top: 30px; margin-bottom: 0;">
                    Thank you,<br>
                    <strong>StartupAI Security Team</strong>
                </p>
                
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="font-size: 13px; line-height: 18px; color: #9ca3af; text-align: center; margin-bottom: 0;">
                    This is an automated security notification. Please do not reply directly to this email.<br>
                    © {timezone.now().year} StartupAI. All rights reserved.
                </p>
            </div>
        </div>
    </div>
    """
    
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.EMAIL_HOST_USER,
            to=[user.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
    except Exception as e:
        logger.error("Login alert email error for %s: %s", user.email, e)
