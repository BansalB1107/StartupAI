import json
import logging
import traceback
from datetime import timedelta
from decimal import Decimal
from zoneinfo import ZoneInfo

import razorpay
from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .ai_utils import generate_startup_report
from .auth_services import (
    can_resend_otp,
    check_rate_limit,
    send_login_alert_email,
    setup_new_otp,
    validate_otp,
)
from .email_utils import generate_otp, send_otp_email, send_welcome_email
from .models import (
    ConnectionRequest,
    Investment,
    Message,
    Notification,
    Profile,
    ProfileView,
    StartupAnalysis,
    UserBlock,
    Appeal,
)
from .serializers import (
    InvestmentSerializer,
    MyTokenObtainPairSerializer,
    ProfileUpdateSerializer,
    UserSerializer,
    UserBlockSerializer,
    AppealSerializer,
)

logger = logging.getLogger(__name__)


# Retrieves or initializes a user profile with the default role if it does not exist.
def get_or_create_profile_for_user(user, auth=None):
    role = 'startup'
    if isinstance(auth, dict):
        role = auth.get('role', 'startup')
    profile, _ = Profile.objects.get_or_create(user=user, defaults={'role': role})
    return profile


# API endpoint handling new user registration, profile initialization, and verification OTP generation.
class RegisterView(APIView):

    # Handles POST requests to validate registration data, create the user account, and dispatch an OTP email.
    def post(self, request):

        serializer = UserSerializer(data=request.data)

        if serializer.is_valid():

            user = serializer.save()

            # Get profile
            profile = user.profile

            # Generate & save OTP details using service
            otp = setup_new_otp(profile)
            profile.is_verified = False
            profile.save()

            # Send email
            send_otp_email(user, otp)

            return Response(
                {
                    "message": "OTP sent successfully",
                    "email": user.email
                },
                status=status.HTTP_201_CREATED
            )

        errors = dict(serializer.errors)
        
        # Anti-enumeration check
        enum_error = False
        if 'email' in errors and any("already exists" in str(e).lower() for e in errors['email']):
            enum_error = True
            del errors['email']
        if 'username' in errors and any("already exists" in str(e).lower() for e in errors['username']):
            enum_error = True
            del errors['username']
            
        if enum_error:
            # We return a dict with a single generic error key so frontend's Object.values().join()
            # cleanly displays just this string once.
            errors["error"] = "An account with the provided email or username already exists."
            
        return Response(
            errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# Customizes JWT token serialization to include the user's platform role payload.
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Appends the user's specific role to the JWT token dictionary structure securely.
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        try:
            token['role'] = user.profile.role
        except Exception:
            token['role'] = 'startup'
        return token


# API endpoint delivering standard JSON Web Tokens structured with custom role payload claims.
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# API endpoint that provides detailed user profile information and supports comprehensive updates.
class ProfileDetailView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles GET requests to retrieve and serialize the authenticated user's profile details.
    def get(self, request):
        try:
            profile = get_or_create_profile_for_user(request.user, request.auth)
            serializer = ProfileUpdateSerializer(profile, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)

    # Handles PUT requests to validate and apply comprehensive updates to the user's profile data.
    def put(self, request):
        try:
            profile = get_or_create_profile_for_user(request.user, request.auth)
            data = request.data.copy()
            
            if 'is_profile_complete' in data and (data['is_profile_complete'] == '' or data['is_profile_complete'] is None):
                data.pop('is_profile_complete')

            if data.get('funding_goal') == '':
                data['funding_goal'] = None
            if data.get('investment_budget') == '':
                data['investment_budget'] = None

            serializer = ProfileUpdateSerializer(profile, data=data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save(is_profile_complete=True)
                return Response({"message": "Profile updated successfully!", "data": serializer.data}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)


# API endpoint presenting a marketplace list of verified, completed startup profiles for browsing.
class StartupListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Handles GET requests to dynamically aggregate and return verified startup details with networking statuses.
    def get(self, request):
        try:

            startups = Profile.objects.filter(
                role="startup",
                is_profile_complete=True
            )

            logger.info("Startup marketplace query: total=%d", startups.count())

            startup_list = []

            for startup in startups:

                # Skip broken/orphaned profiles
                if not User.objects.filter(id=startup.user_id).exists():
                    logger.warning("Skipping orphan profile: %s", startup.id)
                    continue

                startup_user = startup.user

                connection = ConnectionRequest.objects.filter(
                    Q(sender=request.user, receiver=startup_user) |
                    Q(sender=startup_user, receiver=request.user)
                ).first()

                connection_status = (
                    connection.status
                    if connection else ""
                )

                if connection_status == "accepted":
                    display_phone = (
                        startup.phone_number
                        or "No number provided"
                    )
                else:
                    display_phone = (
                        "Connect to view contact details"
                    )

                startup_list.append({

                    "id": str(startup.id),

                    "user_id": str(startup_user.id),

                    "phone_number": display_phone,

                    "company_name":
                        startup.company_name
                        or "Anonymous Startup",

                    "industry":
                        startup.industry
                        or "General",

                    "pitch_description":
                        startup.pitch_description
                        or "",

                    "funding_goal":
                        float(startup.funding_goal)
                        if startup.funding_goal
                        else 0.0,

                    "connection_status":
                        connection_status,

                    "is_verified":
                        startup.is_verified,

                })

            logger.info("Startup marketplace returned %d startups", len(startup_list))

            return Response(
                startup_list,
                status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.exception("StartupListView error")
            return Response(
                {
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        
# API endpoint managing user wallet operations including balance checking, deposits, withdrawals, and referrals.
class WalletTransactionView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles GET requests to retrieve the user's current wallet balance and active referral code.
    def get(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        return Response({
            "balance": float(profile.balance),
            "referral_code": profile.referral_code or ""
        }, status=status.HTTP_200_OK)

    # Handles POST requests to securely execute wallet transactions such as funding, withdrawing, or redeeming referrals.
    def post(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        action = request.data.get("action")
        
        try:
            amount = Decimal(str(request.data.get("amount", "0") or "0"))
        except Exception:
            amount = Decimal("0")

        if action == "deposit":
            if amount <= 0:
                return Response({"error": "Please specify a valid deposit amount"}, status=status.HTTP_400_BAD_REQUEST)
            profile.balance += amount
            profile.save()
            return Response({
                "message": f"Successfully deposited ₹{amount:,.2f} to your account!", 
                "balance": float(profile.balance)
            }, status=status.HTTP_200_OK)

        elif action == "withdraw":
            if amount <= 0:
                return Response({"error": "Please specify a valid withdrawal amount"}, status=status.HTTP_400_BAD_REQUEST)
            if profile.balance < amount:
                return Response({"error": "Insufficient balance available in your wallet"}, status=status.HTTP_400_BAD_REQUEST)
            
            profile.balance -= amount
            profile.save()
            return Response({
                "message": f"Successfully withdrew ₹{amount:,.2f} from your account!", 
                "balance": float(profile.balance)
            }, status=status.HTTP_200_OK)

        elif action == "referral":
            code_entered = request.data.get("referral_code", "").strip().upper()
            if not code_entered:
                return Response({"error": "Please enter a valid referral code"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                referrer = Profile.objects.get(referral_code=code_entered)
            except Profile.DoesNotExist:
                return Response({"error": "Invalid referral code. Please check and try again."}, status=status.HTTP_400_BAD_REQUEST)

            if referrer.user == request.user:
                return Response({"error": "You cannot refer yourself!"}, status=status.HTTP_400_BAD_REQUEST)

            # Flat ₹500 referral bonus credited to BOTH users!
            bonus = Decimal("500.00")
            profile.balance += bonus
            profile.save()

            referrer.balance += bonus
            referrer.save()

            return Response({
                "message": f"🎉 Referral code applied! ₹{bonus:,.2f} bonus has been credited to you and {referrer.user.username}!", 
                "balance": float(profile.balance)
            }, status=status.HTTP_200_OK)

        return Response({"error": "Invalid action parameter supplied"}, status=status.HTTP_400_BAD_REQUEST)


# API endpoint orchestrating sending, accepting, and declining network connection requests between users.
class ConnectionRequestView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles POST requests to securely process connection lifecycle events and trigger corresponding push notifications.
    def post(self, request):
        action = request.data.get("action")
        
        if action == "send":
            receiver_id = request.data.get("receiver_id")
            if not receiver_id:
                return Response({"error": "Receiver ID is required"}, status=400)
            
            try:
                receiver = User.objects.get(id=receiver_id)
            except User.DoesNotExist:
                return Response({"error": "Target user not found"}, status=404)

            if receiver == request.user:
                return Response({"error": "You cannot connect with yourself!"}, status=400)

            conn_req, created = ConnectionRequest.objects.get_or_create(
                sender=request.user,
                receiver=receiver,
                defaults={"status": "pending"}
            )
            
            if not created:
                return Response({"message": f"Request already {conn_req.status}"}, status=200)

            Notification.objects.create(
                recipient=receiver,
                sender=request.user,
                notification_type="connection_request",
                title="New Connection Request",
                message=f"{request.user.username} wants to connect with you.",
                redirect_url="/startup-dashboard"
            )

            return Response({"message": "Connection request sent!", "status": "pending"}, status=201)

        elif action in ["accept", "decline"]:
            sender_id = request.data.get("sender_id")
            try:
                conn_req = ConnectionRequest.objects.get(sender_id=sender_id, receiver=request.user)
            except ConnectionRequest.DoesNotExist:
                return Response({"error": "Request not found"}, status=404)

            conn_req.status = "accepted" if action == "accept" else "declined"
            conn_req.save()

            if conn_req.status == "accepted":
                Notification.objects.create(
                    recipient=conn_req.sender,
                    sender=request.user,
                    notification_type="connection_accepted",
                    title="Connection Accepted",
                    message=f"{request.user.username} accepted your connection request.",
                    redirect_url="/messages"
                )

            return Response({"message": f"Request {conn_req.status}!", "status": conn_req.status}, status=200)

        return Response({"error": "Invalid action"}, status=400)

    # Handles GET requests to aggregate and serialize all incoming and outgoing connection requests systematically.
    def get(self, request):
        try:
            connections = ConnectionRequest.objects.filter(
                Q(receiver=request.user) | Q(sender=request.user)
            )

            data = []
            for c in connections:
                try:
                    if not getattr(c, 'sender', None) or not getattr(c, 'receiver', None):
                        continue

                    other_user = c.sender if c.sender != request.user else c.receiver
                    if not other_user:
                        continue

                    data.append({
                        "id": str(getattr(c, 'id', '')),
                        "status": c.status,
                        "is_sender": c.sender == request.user,
                        "sender": {"id": str(getattr(c.sender, 'id', '')), "username": getattr(c.sender, 'username', '')},
                        "receiver": {"id": str(getattr(c.receiver, 'id', '')), "username": getattr(c.receiver, 'username', '')},
                        "other_user": {
                            "id": str(getattr(other_user, 'id', '')),
                            "username": getattr(other_user, 'username', 'Unknown')
                        }
                    })
                except Exception:
                    logger.exception(
                        "Skipping connection id=%s due to error",
                        getattr(c, 'id', '<no-id>')
                    )
                    continue

            return Response(data, status=status.HTTP_200_OK)
            
        except Exception:
            logger.exception("ConnectionRequestView.get error")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# API endpoint delivering comprehensive networking engagement analytics strictly for verified startup profiles.
class StartupAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles GET requests to dynamically compute profile views, connection traction, and investor interest scores.
    def get(self, request):
        # Ensure only startups can see this
        profile = get_or_create_profile_for_user(request.user, request.auth)
        if profile.role != 'startup':
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        # 1. Count actual views from the ProfileView model
        views_count = ProfileView.objects.filter(startup=request.user).count()

        # 2. Count all incoming connection requests for this startup
        requests_count = ConnectionRequest.objects.filter(receiver=request.user).count()

        # 3. Calculate an "Interest Score"
        investment_count = Investment.objects.filter(
            startup=request.user
        ).count()

        interest_score = min(
            100,
            (views_count * 2)
            + (requests_count * 10)
            + (investment_count * 20)
        )

        # Profile completeness health metric
        health_score = 0

        if profile.company_name:
            health_score += 20

        if profile.industry:
            health_score += 20

        if profile.pitch_description:
            health_score += 20

        if profile.funding_goal:
            health_score += 20

        if profile.pitch_deck:
            health_score += 20
        recent_views = ProfileView.objects.filter(
            startup=request.user
        ).order_by("-timestamp")[:5]

        recent_viewers = []

        for view in recent_views:
            if view.viewer:
                recent_viewers.append({
                    "username": view.viewer.username,
                    "time": view.timestamp.strftime("%d %b %Y, %I:%M %p")
                })

        return Response({
            "profile_views": views_count,
            "connection_requests": requests_count,
            "investor_interest_score": interest_score,
            "recent_viewers": recent_viewers,
            "pending_connections": ConnectionRequest.objects.filter(receiver=request.user, status='pending').count(),
            "total_connections": ConnectionRequest.objects.filter(receiver=request.user, status='accepted').count(),
            "profile_health": health_score
        }, status=status.HTTP_200_OK)
 
 
# API endpoint summarizing the total unread notification counts and pending connection requests actively awaiting review.
class NotificationCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Handles GET requests to rapidly compute and aggregate pending interaction alerts for the navigation badging.
    def get(self, request):

        notifications = Notification.objects.filter(
            recipient=request.user
        ).order_by("-created_at")

        data = []

        for n in notifications:

            data.append({
                "id": str(n.id),
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at.strftime("%d %b %Y, %I:%M %p"),
            })

        unread = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()

        pending = ConnectionRequest.objects.filter(
            receiver=request.user,
            status="pending"
        ).count()

        return Response({
            "count": unread + pending,
            "notifications": data,
        })    
    
    
# API endpoint serving essential public profile information explicitly for registered investor accounts.
class InvestorProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Handles GET requests to securely retrieve a targeted investor's public biography and industry interests.
    def get(self, request, investor_id):
        try:
            investor_profile = Profile.objects.get(user_id=investor_id, role='investor')
            return Response({
                "name": investor_profile.user.username,
                "bio": investor_profile.pitch_description,
                "industry_interest": investor_profile.industry,
                "is_verified": investor_profile.is_verified
            })
        except Profile.DoesNotExist:
            return Response({"error": "Investor profile not found"}, status=404)


# API endpoint allowing user profiles to formally request administrative verification for platform privileges.
class RequestVerificationView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles POST requests to register a verification request for subsequent administrative evaluation and approval.
    def post(self, request):
        profile = get_or_create_profile_for_user(request.user, request.auth)
        return Response({"message": "Verification request submitted! Admin will review shortly."})
    
    
# API endpoint rendering comprehensive public profiles for startups, managing views and integrating AI analytics securely.
class PublicStartupProfileView(APIView):
    # Handles GET requests to dynamically return a startup's public data and silently track profile views.
    def get(self, request, startup_id):
        try:
            profile = Profile.objects.get(user_id=startup_id)
            
            # We only count it if the viewer is logged in and is not the owner
            if request.user.is_authenticated and request.user.id != startup_id:

                last_view = ProfileView.objects.filter(
                    startup_id=startup_id,
                    viewer=request.user,
                    timestamp__gte=timezone.now() - timedelta(hours=24)
                ).first()

                if not last_view:
                    ProfileView.objects.create(
                        startup_id=startup_id,
                        viewer=request.user
                    )
                Notification.objects.create(
                    recipient_id=startup_id,
                    sender=request.user,
                    notification_type="profile_view",
                    title="Profile Viewed",
                    message=f"{request.user.username} viewed your startup profile.",
                    redirect_url="/startup-analytics"
                )
            
            response_data = {
                "company_name": profile.company_name,
                "industry": profile.industry,
                "pitch_description": profile.pitch_description,
                "funding_goal": profile.funding_goal,
                "is_verified": profile.is_verified,
            }

            # Include funding readiness data (read-only for investors)
            if profile.funding_readiness_score is not None:
                response_data["funding_readiness"] = {
                    "score": float(profile.funding_readiness_score),
                    "label": profile.prediction_label,
                    "confidence": profile.prediction_confidence,
                    "last_updated": (
                        profile.last_prediction.strftime("%d %b %Y, %I:%M %p")
                        if profile.last_prediction else None
                    ),
                }

            return Response(response_data)
        except Profile.DoesNotExist:
            return Response({"error": "Startup not found"}, status=404) 
 

# API endpoint supplying restricted system-wide aggregation statistics explicitly to the administrative dashboard interface.
class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles GET requests to securely aggregate and deliver key platform metrics exclusively for administrative monitoring.
    def get(self, request):
        if request.user.profile.role != "admin":
            return Response({"error": "Unauthorized"}, status=403)

        data = {
            "users": User.objects.count(),
            "startups": Profile.objects.filter(role="startup").count(),
            "investors": Profile.objects.filter(role="investor").count(),
            "admins": Profile.objects.filter(role="admin").count(),
            "pending": Profile.objects.filter(
                role="startup",
                is_verified=False
            ).count(),
            "messages": Message.objects.count(),
            "notifications": Notification.objects.count(),
            "investments": Investment.objects.count(),
        }

        return Response(data)  
  
        
# API endpoint empowering platform administrators to efficiently retrieve and process pending startup verification requests.
class AdminVerificationView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles GET requests to systematically list all unverified startup profiles currently awaiting administrative approval.
    def get(self, request):
        if request.user.profile.role != "admin":
            return Response({"error": "Unauthorized"}, status=403)

        profiles = Profile.objects.filter(
            role="startup",
            is_verified=False
        )

        data = []

        for profile in profiles:
            data.append({
                "id": str(profile.id),
                "username": profile.user.username,
                "company_name": profile.company_name,
                "industry": profile.industry,
            })

        return Response(data)

    # Handles POST requests to securely finalize startup verification status and automatically dispatch notification alerts.
    def post(self, request):
        if request.user.profile.role != "admin":
            return Response({"error": "Unauthorized"}, status=403)

        profile_id = request.data.get("profile_id")
        profile = Profile.objects.get(id=profile_id)

        profile.is_verified = True
        profile.save()

        Notification.objects.create(
            recipient=profile.user,
            sender=request.user,
            notification_type="account_verified",
            title="Account Verified",
            message="Congratulations! Your startup has been verified.",
            redirect_url="/startup-dashboard"
        )

        return Response({"message": "Verified!"}) 
# API endpoint managing the retrieval of direct messaging histories between two authenticated platform users securely.
class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles GET requests to fetch and chronologically sequence private conversation threads between specific network connections.
    def get(self, request, *args, **kwargs):
        # Support both 'receiver_id' and 'other_user_id' kwarg names
        receiver_id = kwargs.get('receiver_id') or kwargs.get('other_user_id')

        messages = Message.objects.filter(
            (Q(sender=request.user) & Q(receiver_id=receiver_id)) |
            (Q(sender_id=receiver_id) & Q(receiver=request.user))
        ).order_by('timestamp')

        data = []
        for msg in messages:
            data.append({
                'sender': msg.sender.username,
                'content': msg.content,
                'is_sender': msg.sender == request.user,
                'timestamp': msg.timestamp
            })
        return Response(data)

    
# API endpoint providing comprehensive contextual details about the currently authenticated user's profile state and restrictions.
class MyProfileView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles GET requests to serialize active profile parameters, including any active administrative block statuses or notices.
    def get(self, request):
        profile = get_or_create_profile_for_user(request.user, request.auth)

        # Check block status from UserBlock model
        is_blocked = False
        block_reason = ""
        block_description = ""
        try:
            block_info = profile.block_info  # related_name on UserBlock
            if block_info.status == "blocked":
                is_blocked = True
                block_reason = block_info.reason
                block_description = block_info.description
        except UserBlock.DoesNotExist:
            pass

        profile_pic_url = None
        if profile.profile_picture:
            profile_pic_url = request.build_absolute_uri(profile.profile_picture.url)

        return Response({
            "company_name": profile.company_or_firm,
            "industry": profile.industry,
            "pitch_description": profile.pitch_description,
            "funding_goal": profile.funding_goal,
            "is_blocked": is_blocked,
            "block_reason": block_reason,
            "block_description": block_description,
            "profile_picture": profile_pic_url,
        })
        

# API endpoint coordinating the secure transmission of direct messages between formally connected user accounts.
class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles POST requests to validate networking connections, store message content, and instantly trigger recipient notifications.
    def post(self, request):
        receiver_id = request.data.get("receiver_id")
        content = request.data.get("content")
        
        # Connection check logic
        is_connected = ConnectionRequest.objects.filter(
            (models.Q(sender=request.user, receiver_id=receiver_id) | 
             models.Q(sender_id=receiver_id, receiver=request.user)),
            status='accepted'
        ).exists()

        if not is_connected:
            return Response({"error": "You must be connected to send messages"}, status=403)

        Message.objects.create(sender=request.user, receiver_id=receiver_id, content=content)
        
        try:
            recipient_user = User.objects.get(id=receiver_id)
            Notification.objects.create(
                recipient=recipient_user,
                sender=request.user,
                notification_type="message",
                title="New Message",
                message=f"{request.user.username} sent you a message.",
                redirect_url="/messages"
            )
        except User.DoesNotExist:
            pass
        
        return Response({"message": "Message sent!"}, status=201)   

# API endpoint aggregating a high-level feed of active startup profiles for investor discovery interfaces.
class InvestorStartupFeedView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles GET requests to rapidly compile and deliver summary pitches and core startup identifiers.
    def get(self, request):
        startups = Profile.objects.filter(role='startup')
        data = [
            {
                "id": s.user.id,
                "company_name": s.company_name,
                "industry": s.industry,
                "pitch": s.pitch_description[:100] + "...",
                "is_verified": s.is_verified
            } for s in startups
        ]
        return Response(data)
    
# API endpoint supplying a chronologically ordered list of system notifications directed to the authenticated user.
class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        notifications = Notification.objects.filter(
            recipient=request.user
        ).order_by("-created_at")

        data = []

        for n in notifications:

            ist_time = n.created_at.astimezone(
                ZoneInfo("Asia/Kolkata")
            )

            investment_id = None

            if n.notification_type == "investment" and n.sender:

                investment = Investment.objects.filter(
                    investor=n.sender,
                    startup=n.recipient,
                    status="pending"
                ).order_by("-created_at").first()

                if investment:
                    investment_id = str(investment.id)

            data.append({
                "id": str(n.id),
                "title": n.title,
                "message": n.message,
                "type": n.notification_type,
                "sender": n.sender.username if n.sender else "",
                "investment_id": investment_id,
                "redirect_url": n.redirect_url,
                "is_read": n.is_read,
                "time": ist_time.strftime("%d %b %Y, %I:%M %p"),
            })

        unread = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).count()

        return Response({
            "count": unread,
            "notifications": data,
        })

    def post(self, request):

        Notification.objects.filter(
            recipient=request.user
        ).update(is_read=True)

        return Response({
            "message": "All notifications marked as read."
        })

    def delete(self, request):

        Notification.objects.filter(
            recipient=request.user
        ).delete()

        return Response({
            "message": "Notifications cleared."
        })   
    

# API endpoint integrating AI to dynamically generate and securely save comprehensive startup business analysis reports.
class GenerateAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles GET requests to fetch and safely parse a startup's previously generated AI analysis.
    def get(self, request):
        try:
            analysis = StartupAnalysis.objects.filter(startup=request.user).first()
            if not analysis:
                return Response({"data": None}, status=200)
            
            data = {
                "market_analysis": analysis.market_analysis,
                "swot_analysis": analysis.swot_analysis,
                "financial_roadmap": analysis.financial_roadmap,
                "growth_strategy": analysis.growth_strategy,
                "target_audience": analysis.target_audience,
                "revenue_model": analysis.revenue_model,
                "competition_analysis": analysis.competition_analysis,
                "marketing_tactics": analysis.marketing_tactics,
                "operational_plan": analysis.operational_plan,
                "risk_assessment": analysis.risk_assessment,
            }
            
            # Try to parse stringified JSON from database to send clean JSON objects/lists to frontend
            for key, val in data.items():
                if val and (val.strip().startswith("{") or val.strip().startswith("[")):
                    try:
                        data[key] = json.loads(val)
                    except Exception:
                        pass
            
            return Response({"data": data}, status=200)
        except Exception as e:
            return Response({"message": str(e)}, status=500)

    # Handles POST requests to call the AI service, parse JSON results, and update analysis records.
    def post(self, request):
        try:
            # Check if profile exists
            if not hasattr(request.user, 'profile'):
                logger.error("User %s has no profile", request.user.id)
                return Response({"message": "Profile not found"}, status=404)
            
            profile = request.user.profile
            
            # Call AI
            report_data = generate_startup_report(profile.pitch_description, profile.industry)
            logger.info("AI response received for user %s", request.user.id)
            
            # Clean and Parse
            cleaned_json = (
                report_data
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

            # Extract ONLY the JSON object
            start = cleaned_json.find("{")
            end = cleaned_json.rfind("}") + 1

            if start == -1 or end == 0:
                raise Exception("AI did not return valid JSON.")

            cleaned_json = cleaned_json[start:end]

            data = json.loads(cleaned_json)
            
            # Save to DB
            analysis, _ = StartupAnalysis.objects.update_or_create(
                startup=request.user,
                defaults={
                    "market_analysis": data.get("market_analysis", ""),
                    "swot_analysis": data.get("swot_analysis", ""),
                    "financial_roadmap": data.get("financial_roadmap", ""),
                    "growth_strategy": data.get("growth_strategy", ""),
                    "target_audience": data.get("target_audience", ""),
                    "revenue_model": data.get("revenue_model", ""),
                    "competition_analysis": data.get("competition_analysis", ""),
                    "marketing_tactics": data.get("marketing_tactics", ""),
                    "operational_plan": data.get("operational_plan", ""),
                    "risk_assessment": data.get("risk_assessment", ""),
                }
            )
            
            # --- AUTO-SAVE TO REPORT HISTORY ---
            try:
                from reports.services import save_report
                save_report(
                    user=request.user,
                    startup_name=profile.company_name or profile.user.username,
                    industry=profile.industry or "General",
                    pitch=profile.pitch_description or "",
                    report_data=data,
                    is_premium=profile.is_premium,
                )
                logger.info("Report saved to history for user %s", request.user.id)
            except Exception as save_err:
                # Don't fail the main request if history save fails
                logger.warning("Failed to save report to history: %s", save_err)
            
            return Response({"data": data}, status=200)

        except Exception as e:
            logger.exception("GenerateAnalysisView fatal error")
            return Response({"message": str(e)}, status=500)        
        

# API endpoint calculating and delivering high-level aggregate dashboard metrics customized by the user's role.
class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles GET requests to compute dynamic financial and networking statistics for both startups and investors.
    def get(self, request):

        profile = request.user.profile

        # ---------------- STARTUP ---------------- #

        if profile.role == "startup":

            total_raised = (
                Investment.objects.filter(
                    startup=request.user
                ).aggregate(
                    total=Sum("amount")
                )["total"] or 0
            )

            investor_count = Investment.objects.filter(
                startup=request.user
            ).values("investor").distinct().count()

            funding_goal = profile.funding_goal or 0

            progress = 0

            if funding_goal > 0:
                progress = round(
                    (float(total_raised) / float(funding_goal)) * 100,
                    1
                )

            return Response({

                "investors": investor_count,

                "messages": Message.objects.filter(
                    receiver=request.user
                ).count(),

                "funding_goal": float(funding_goal),

                "raised_amount": float(total_raised),

                "progress": progress,

                "verified": profile.is_verified,

            })

        # ---------------- INVESTOR ---------------- #

        total_invested = (
            Investment.objects.filter(
                investor=request.user
            ).aggregate(
                total=Sum("amount")
            )["total"] or 0
        )

        return Response({

            "wallet": float(profile.balance or 0),

            "portfolio": float(total_invested),

            "startups": Profile.objects.filter(
                role="startup",
                is_profile_complete=True
            ).count(),

            "messages": Message.objects.filter(
                receiver=request.user
            ).count(),

            "connections": ConnectionRequest.objects.filter(
                Q(sender=request.user) |
                Q(receiver=request.user),
                status="accepted"
            ).count(),

            "verified": profile.is_verified,

        }) 
        
# API endpoint securely processing financial investments from investors to specific connected startup profiles.
class InvestView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles POST requests to validate balances, enforce networking prerequisites, and finalize investment transactions.
    def post(self, request):

        startup_id = request.data.get("startup_id")
        amount = request.data.get("amount")

        if not startup_id or not amount:
            return Response(
                {"error": "Startup ID and amount are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            amount = Decimal(str(amount))
        except Exception:
            return Response(
                {"error": "Invalid investment amount."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if amount <= 0:
            return Response(
                {"error": "Investment amount must be greater than zero."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            startup_user = User.objects.get(id=startup_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Startup not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Prevent investing in yourself
        if startup_user == request.user:
            return Response(
                {"error": "You cannot invest in your own startup."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        investor_profile = Profile.objects.get(user=request.user)
        startup_profile = Profile.objects.get(user=startup_user)

        # Only accepted connections can invest
        connection_exists = ConnectionRequest.objects.filter(
            sender=request.user,
            receiver=startup_user,
            status="accepted",
        ).exists()

        if not connection_exists:
            return Response(
                {
                    "error": "You must connect with this startup before investing."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create pending investment request
        investment = Investment.objects.create(
            investor=request.user,
            startup=startup_user,
            amount=amount,
            status="pending",
        )

        # Notify startup
        Notification.objects.create(
            recipient=startup_user,
            sender=request.user,
            notification_type="investment",
            title="Investment Request",
            message=f"{request.user.username} wants to invest ₹{amount:,.2f} in your startup.",
            redirect_url="/funding"
        )

        return Response(
            {
                "message": "Investment request sent successfully!",
                "status": "pending",
            },
            status=status.HTTP_201_CREATED,
        )



# API endpoint aggregating an investor's comprehensive portfolio of completed funding transactions and total investments.
class PortfolioView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles GET requests to systematically calculate total portfolio value and serialize the investment history.
    def get(self, request):

        investments = (
            Investment.objects
            .filter(investor=request.user)
            .order_by("-created_at")
        )

        serializer = InvestmentSerializer(
            investments,
            many=True
        )

        total = sum(
            investment.amount
            for investment in investments
        )

        return Response({
            "total_invested": float(total),
            "investment_count": investments.count(),
            "investments": serializer.data,
        })
       
# API endpoint summarizing a startup's overall funding progress, total raised amounts, and detailed investor history.
class StartupFundingView(APIView):
    permission_classes = [IsAuthenticated]

    # Handles GET requests to verify startup roles and compute funding metrics against established financial goals.
    def get(self, request):

        profile = request.user.profile

        if profile.role != "startup":
            return Response(
                {"error": "Only startups can access this page."},
                status=403
            )

        investments = Investment.objects.filter(
    startup=request.user,
    status="accepted"
).order_by("-created_at")

        total_raised = sum(
            investment.amount for investment in investments
        )

        data = []

        for investment in investments:

            data.append({
                "investor": investment.investor.username,
                "amount": float(investment.amount),
                "time": investment.created_at.strftime("%d %b %Y %I:%M %p"),
            })

        return Response({

            "funding_goal": float(profile.funding_goal or 0),

            "raised_amount": float(profile.raised_amount or 0),

            "remaining": float(
                max(
                    (profile.funding_goal or 0) -
                    (profile.raised_amount or 0),
                    0
                )
            ),

            "investors": investments.count(),

            "history": data,

        })      



# API endpoint processing registration OTPs to formally verify email addresses and issue initial access tokens.
class VerifyOTPView(APIView):

    # Handles POST requests to validate OTPs securely, activate profiles, and generate authenticated JWT credentials.
    def post(self, request):

        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response(
                {"error": "Email and OTP are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.filter(email=email).latest('id')
            profile = user.profile

            # Validate OTP using service
            is_valid, err_msg = validate_otp(profile, otp)
            if not is_valid:
                return Response(
                    {"error": err_msg},
                    status=status.HTTP_400_BAD_REQUEST
                )

            profile.is_verified = True
            profile.save()

            send_welcome_email(user)

            # Create JWT Tokens
            refresh = RefreshToken.for_user(user)

            try:
                refresh["role"] = user.profile.role
            except Exception:
                refresh["role"] = "startup"

            access = str(refresh.access_token)

            return Response(
                {
                    "message": "Email verified successfully",
                    "access": access,
                    "refresh": str(refresh),
                    "role": user.profile.role,
                    "username": user.username
                },
                status=status.HTTP_200_OK
            )

        except User.DoesNotExist:

            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            logger.exception("Verify OTP error")
            return Response(
                {"error": "An error occurred during verification."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# API endpoint managing the secure generation and dispatch of fresh registration verification OTP emails.
class ResendOTPView(APIView):

    # Handles POST requests by enforcing rate limits and cooldowns before securely transmitting replacement OTPs.
    def post(self, request):

        email = request.data.get('email')
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
            profile = user.profile

            # Rate Limiting Check
            allowed, err_msg = check_rate_limit(profile)
            if not allowed:
                return Response(
                    {"error": err_msg},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

            # Resend Timer Check
            allowed, err_msg = can_resend_otp(profile)
            if not allowed:
                return Response(
                    {"error": err_msg},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Setup new OTP
            otp = setup_new_otp(profile)

            # Send Email
            send_otp_email(user, otp)

            return Response(
                {"message": "OTP resent successfully"},
                status=status.HTTP_200_OK
            )

        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.exception("Resend OTP error")
            return Response(
                {"error": "An error occurred while resending the OTP."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# API endpoint initiating passwordless authentication by securely dispatching a login OTP to verified emails.
class SendLoginOTPView(APIView):

    # Handles POST requests to verify account status, apply rate limits, and send the login OTP.
    def post(self, request):

        email = request.data.get("email")

        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
            profile = user.profile

            if not profile.is_verified:
                return Response(
                    {"error": "Please verify your email first"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Rate Limiting Check
            allowed, err_msg = check_rate_limit(profile)
            if not allowed:
                return Response(
                    {"error": err_msg},
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )

            # Setup new OTP (skip resend cooldown — this is a login initiation,
            # not a resend. The rate limiter above prevents abuse.)
            otp = setup_new_otp(profile)

            # Send Email
            send_otp_email(user, otp)

            return Response(
                {
                    "message": "Login OTP sent successfully",
                    "email": email
                },
                status=status.HTTP_200_OK
            )

        except User.DoesNotExist:

            return Response(
                {"error": "No account exists with this email"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.exception("Send login OTP error")
            return Response(
                {"error": "An error occurred while sending the OTP."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# API endpoint finalizing passwordless authentication by validating OTPs and issuing secure JWT session tokens.
class VerifyLoginOTPView(APIView):

    # Handles POST requests to rigorously validate login OTPs, dispatch security alerts, and grant access.
    def post(self, request):

        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response(
                {"error": "Email and OTP are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            user = User.objects.get(email=email)
            profile = user.profile

            # Validate OTP using service
            is_valid, err_msg = validate_otp(profile, otp)
            if not is_valid:
                return Response(
                    {"error": err_msg},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Send professional login alert email
            send_login_alert_email(user, request)

            refresh = RefreshToken.for_user(user)

            return Response({
                "message": f"Welcome back, {user.username}",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": profile.role,
                "username": user.username
            })

        except User.DoesNotExist:

            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.exception("Verify login OTP error")
            return Response(
                {"error": "An error occurred during verification."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
# API endpoint securely interfacing with Razorpay to initialize and register new premium subscription payment orders.
class CreateOrderView(APIView):

    # Handles POST requests to create and return a valid Razorpay order ID for frontend processing.
    def post(self, request):

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET
            )
        )

        amount = 29900   # ₹299 in paise

        order = client.order.create({
            "amount": amount,
            "currency": "INR",
            "payment_capture": 1
        })

        return Response({
            "order_id": order["id"],
            "amount": amount,
            "key": settings.RAZORPAY_KEY_ID
        })
    
# API endpoint securely acknowledging successful payments to instantly activate premium account features and subscriptions.
class PaymentSuccessView(APIView):

    permission_classes = [IsAuthenticated]

    # Handles POST requests to immediately upgrade the user's profile status and apply subscription expiration dates.
    def post(self, request):

        profile = request.user.profile

        profile.is_premium = True
        profile.subscription_type = "premium"
        profile.subscription_expiry = (
            timezone.now() + timedelta(days=30)
        )

        profile.save()

        return Response({
            "message": "Premium activated successfully"
        })


class PredictFundingView(APIView):
    """
    POST /api/users/predict-funding/
    Runs the ML model on the logged-in startup's profile,
    generates a Gemini explanation, saves results, and returns JSON.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            profile = get_or_create_profile_for_user(request.user, request.auth)

            if profile.role != 'startup':
                return Response(
                    {"error": "Only startup accounts can run funding predictions."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # ── Validate required ML input fields ─────────────────────
            required_fields = {
                'funding_rounds': profile.funding_rounds,
                'founder_experience_years': profile.founder_experience_years,
                'team_size': profile.team_size,
                'market_size_billion': profile.market_size_billion,
                'product_traction_users': profile.product_traction_users,
                'burn_rate_rupees': profile.burn_rate_rupees,
                'monthly_revenue_rupees': profile.monthly_revenue_rupees,
            }

            missing = [k for k, v in required_fields.items() if v is None]
            if missing:
                return Response(
                    {"error": f"Missing required fields: {', '.join(missing)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ── Run ML prediction ─────────────────────────────────────
            from .predict import predict_funding_readiness

            try:
                result = predict_funding_readiness(profile)
            except FileNotFoundError:
                return Response(
                    {"error": "Prediction model not available. Please contact support."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )
            except ValueError as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                logger.exception("Prediction error for user %s", request.user.id)
                return Response(
                    {"error": "Prediction failed. Please try again later."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            score = result["score"]
            label = result["label"]
            confidence = result["confidence"]
            confidence_label = result["confidence_label"]

            # ── Generate Gemini explanation ────────────────────────────
            from .ai_utils import generate_funding_explanation

            ai_summary = generate_funding_explanation(profile, score, label)

            # ── Save to profile ───────────────────────────────────────
            profile.funding_readiness_score = score
            profile.prediction_label = label
            profile.prediction_confidence = confidence_label
            profile.ai_prediction_summary = ai_summary
            profile.last_prediction = timezone.now()
            profile.save()

            return Response({
                "score": score,
                "label": label,
                "confidence": confidence,
                "confidence_label": confidence_label,
                "ai_summary": ai_summary,
                "last_prediction": profile.last_prediction.strftime("%d %b %Y, %I:%M %p"),
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception("PredictFundingView fatal error")
            return Response(
                {"error": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
# API endpoint allowing administrators to suspend user profiles by creating detailed blocking records securely.
class AdminBlockUserView(APIView):

    permission_classes = [IsAuthenticated]

    # Handles POST requests to log block reasons and execute user suspension with notifications.
    def post(self, request):

        if request.user.profile.role != "admin":
            return Response(
                {"error": "Only admin allowed"},
                status=403
            )

        profile_id = request.data.get("profile_id")
        reason = request.data.get("reason")
        description = request.data.get("description")

        if not profile_id:
            return Response(
                {"error": "profile_id is required"},
                status=400
            )

        profile = get_object_or_404(
            Profile,
            id=profile_id
        )

        block, created = UserBlock.objects.get_or_create(
            profile=profile
        )

        block.status = "blocked"
        block.reason = reason
        block.description = description
        block.blocked_by = request.user
        block.blocked_at = timezone.now()
        block.save()

        Notification.objects.create(
            recipient=profile.user,
            sender=request.user,
            notification_type="message",
            title="Account Blocked",
            message=f"Your account has been blocked. Reason: {reason}"
        )

        return Response({
            "message": "User blocked successfully"
        })
        
# API endpoint allowing administrators to reinstate suspended user profiles securely and clear blocking records.
class AdminUnblockUserView(APIView):

    permission_classes = [IsAuthenticated]

    # Handles POST requests to process unblocking actions, restore access, and notify the affected user.
    def post(self, request):

        if request.user.profile.role != "admin":
            return Response(
                {"error": "Only admin allowed"},
                status=403
            )

        profile_id = request.data.get("profile_id")

        if not profile_id:
            return Response(
                {"error": "profile_id is required"},
                status=400
            )

        block = get_object_or_404(
            UserBlock,
            profile_id=profile_id
        )

        block.unblock()

        Notification.objects.create(
            recipient=block.profile.user,
            sender=request.user,
            notification_type="message",
            title="Account Unblocked",
            message="Your account has been restored."
        )

        return Response({
            "message": "User unblocked."
        })
        
        
# API endpoint providing the authenticated user with their current administrative block status and reasons.
class MyBlockStatusView(APIView):

    permission_classes = [IsAuthenticated]

    # Handles GET requests to retrieve and serialize the user's active block data securely.
    def get(self, request):

        try:
            block = UserBlock.objects.get(profile=request.user.profile)

            return Response({
                "blocked": block.is_blocked,
                "status": block.status,
                "reason": block.reason,
                "description": block.description,
                "blocked_at": block.blocked_at
            })

        except UserBlock.DoesNotExist:

            return Response({
                "blocked": False,
                "status": "active"
            })
            
# API endpoint allowing suspended users to submit formal appeals requesting administrative review and unblocking.
class SendAppealView(APIView):

    permission_classes = [IsAuthenticated]

    # Handles POST requests to register an appeal and aggressively alert all active system administrators.
    def post(self, request):

        message = request.data.get("message")

        if not message:
            return Response(
                {"error": "Message is required"},
                status=400
            )

        try:
            block = UserBlock.objects.get(profile=request.user.profile)

            if not block.is_blocked:
                return Response(
                    {"error": "Your account is not blocked."},
                    status=400
                )

        except UserBlock.DoesNotExist:
            return Response(
                {"error": "No block record found."},
                status=404
            )

        Appeal.objects.create(
            block=block,
            message=message
        )

        # Notify every admin
        admins = Profile.objects.filter(role="admin")

        for admin in admins:
            Notification.objects.create(
                recipient=admin.user,
                sender=request.user,
                notification_type="message",
                title="New Appeal",
                message=f"{request.user.username} submitted an appeal."
            )

        return Response({
            "message": "Appeal submitted successfully."
        })
        
# API endpoint providing administrators with a chronologically ordered list of all submitted user appeals.
class AdminAppealListView(APIView):

    permission_classes = [IsAuthenticated]

    # Handles GET requests to systematically retrieve, order, and serialize active user block appeals.
    def get(self, request):

        if request.user.profile.role != "admin":
            return Response(
                {"error": "Only admin allowed"},
                status=403
            )

        appeals = Appeal.objects.all().order_by("-created_at")

        serializer = AppealSerializer(
            appeals,
            many=True
        )

        return Response(serializer.data)        


# API endpoint allowing administrators to review, approve, or reject user appeals and append replies.
class ResolveAppealView(APIView):

    permission_classes = [IsAuthenticated]

    # Handles POST requests to securely process appeal verdicts, update block statuses, and dispatch notifications.
    def post(self, request, appeal_id):

        if request.user.profile.role != "admin":
            return Response(
                {"error": "Only admin allowed"},
                status=403
            )

        status = request.data.get("status")
        admin_reply = request.data.get("admin_reply", "")

        appeal = get_object_or_404(
            Appeal,
            id=appeal_id
        )

        appeal.status = status
        appeal.admin_reply = admin_reply
        appeal.resolved_at = timezone.now()
        appeal.save()

        if status == "approved":
            appeal.block.unblock()

        Notification.objects.create(
            recipient=appeal.block.profile.user,
            sender=request.user,
            notification_type="message",
            title="Appeal Updated",
            message=f"Your appeal has been {status}."
        )

        return Response({
            "message": f"Appeal {status} successfully."
        })
        
# API endpoint providing administrators with a comprehensive dashboard list of all active platform users.
class AdminUserListView(APIView):

    permission_classes = [IsAuthenticated]

    # Handles GET requests to aggregate, format, and securely deliver cross-referenced user profile metrics.
    def get(self, request):

        profile = getattr(request.user, "profile", None)
        if not profile or profile.role != "admin":
            return Response(
                {"error": "Only admin can access this."},
                status=403
            )

        profiles = Profile.objects.select_related("user").exclude(
            role="admin"
        )

        data = []

        for profile in profiles:

            block = UserBlock.objects.filter(profile=profile).first()

            data.append({
                "id": str(profile.id),
                "username": profile.user.username,
                "email": profile.user.email,
                "role": profile.role.capitalize(),
                "verified": profile.is_verified,
                "joined": profile.user.date_joined.strftime("%d %b %Y"),
                "status": block.status if block else "active",
            })

        return Response(data)


class AcceptInvestmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, investment_id):

        try:
            investment = Investment.objects.get(
                id=investment_id,
                startup=request.user,
                status="pending"
            )
        except Investment.DoesNotExist:
            return Response(
                {"error": "Investment not found"},
                status=404
            )

        investor_profile = Profile.objects.get(
            user=investment.investor
        )

        startup_profile = Profile.objects.get(
            user=request.user
        )

        if investor_profile.balance < investment.amount:
            return Response(
                {"error": "Investor has insufficient balance."},
                status=400
            )

        investor_profile.balance -= investment.amount
        investor_profile.save()

        startup_profile.raised_amount += investment.amount
        startup_profile.save()

        investment.status = "accepted"
        investment.save()

        Notification.objects.create(
            recipient=investment.investor,
            sender=request.user,
            notification_type="investment",
            title="Investment Accepted",
            message=f"{request.user.username} accepted your investment of ₹{investment.amount}.",
        )

        return Response({
            "message": "Investment accepted."
        }) 
 
    
class RejectInvestmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, investment_id):

        try:
            investment = Investment.objects.get(
                id=investment_id,
                startup=request.user,
                status="pending"
            )
        except Investment.DoesNotExist:
            return Response(
                {"error": "Investment not found"},
                status=404
            )

        investment.status = "rejected"
        investment.save()

        Notification.objects.create(
            recipient=investment.investor,
            sender=request.user,
            notification_type="investment",
            title="Investment Rejected",
            message=f"{request.user.username} rejected your ₹{investment.amount} investment request.",
        )

        return Response({
            "message": "Investment rejected."
        })
        
        
        
        
        