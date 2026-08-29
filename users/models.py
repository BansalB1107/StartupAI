import random
import string

from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


# Generates a unique eight-character alphanumeric referral code for new user profiles.
def generate_referral_code():
    """Generate a unique 8-character referral code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

# Represents a detailed user profile containing personal, business, financial, and machine learning metadata.
class Profile(models.Model):
    
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)

    failed_otp_attempts = models.IntegerField(default=0)

    last_otp_sent = models.DateTimeField(
        blank=True,
        null=True
    )

    ROLE_CHOICES = [
        ('startup', 'Startup'),
        ('investor', 'Investor'),
        ('admin', 'Admin')
    ]

    is_verified = models.BooleanField(default=False)

    email_otp = models.CharField(
        max_length=6,
        null=True,
        blank=True
    )

    otp_created_at = models.DateTimeField(
        null=True,
        blank=True
    )

    otp_attempts = models.IntegerField(default=0)

    last_otp_sent_at = models.DateTimeField(
        null=True,
        blank=True
    )

    otp_request_count = models.IntegerField(default=0)
    otp_window_start = models.DateTimeField(
        null=True,
        blank=True
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='startup')
    
    # Profile completion and basic info
    is_profile_complete = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    
    # For Startups
    company_name = models.CharField(max_length=100, null=True, blank=True)
    industry = models.CharField(max_length=50, null=True, blank=True)
    pitch_description = models.TextField(null=True, blank=True)
    funding_goal = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    raised_amount = models.DecimalField(
    max_digits=15,
    decimal_places=2,
    default=0
)
    
    # For Investors
    company_or_firm = models.CharField(max_length=100, null=True, blank=True)
    interested_industries = models.CharField(max_length=200, null=True, blank=True)
    investment_budget = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Wallet & Referral
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.0)
    referral_code = models.CharField(max_length=10, unique=True, null=True, blank=True)
    
    pitch_deck = models.FileField(upload_to='pitch_decks/', null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    # Premium Subscription

    is_premium = models.BooleanField(
        default=False
    )

    subscription_type = models.CharField(
        max_length=20,
        default='free'
    )

    subscription_expiry = models.DateTimeField(
        null=True,
        blank=True
    )

    reports_used = models.IntegerField(
        default=0
    )

    # --- ML Input Fields (Funding Readiness) ---
    FOUNDER_BACKGROUND_CHOICES = [
        ('academic', 'Academic'),
        ('serial_entrepreneur', 'Serial Entrepreneur'),
        ('corporate', 'Corporate'),
        ('first_time', 'First Time'),
    ]

    funding_rounds = models.IntegerField(default=0)
    founder_experience_years = models.IntegerField(default=0)
    team_size = models.IntegerField(default=1)
    market_size_billion = models.DecimalField(
        max_digits=10, decimal_places=2, default=0
    )
    product_traction_users = models.IntegerField(default=0)
    burn_rate_rupees = models.DecimalField(
        max_digits=15, decimal_places=2, default=0
    )
    monthly_revenue_rupees = models.DecimalField(
        max_digits=15, decimal_places=2, default=0
    )
    founder_background = models.CharField(
        max_length=50,
        choices=FOUNDER_BACKGROUND_CHOICES,
        default='first_time'
    )

    # --- ML Output Fields (Funding Readiness) ---
    funding_readiness_score = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    prediction_confidence = models.CharField(
        max_length=20, blank=True, default=''
    )
    prediction_label = models.CharField(
        max_length=30, blank=True, default=''
    )
    ai_prediction_summary = models.TextField(
        blank=True, default=''
    )
    last_prediction = models.DateTimeField(
        null=True, blank=True
    )

    # Overrides save method to automatically assign a unique referral code before database insertion.
    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = generate_referral_code()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.username} - {self.role}"


# Represents a networking connection request sent between different users on the platform.
class ConnectionRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]
    
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_connections')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_connections')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('sender', 'receiver')
    
    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username} ({self.status})"


# Tracks and logs instances of a startup's profile being viewed by other users.
class ProfileView(models.Model):
    # The startup whose profile was viewed
    startup = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_views', on_delete=models.CASCADE)
    # The investor who viewed it (optional, can be null if anonymous)
    viewer = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='made_views', on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)


# Represents a direct text message sent securely between two authenticated platform users.
class Message(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"From {self.sender.username} to {self.receiver.username}"
    
# Stores system notifications and alerts directed at users for various platform events.
class Notification(models.Model):

    TYPE_CHOICES = [
    ("connection_request", "Connection Request"),
    ("connection_accepted", "Connection Accepted"),
    ("investment", "Investment"),
    ("message", "Message"),
    ("profile_view", "Profile View"),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_notifications",
        null=True,
        blank=True,
    )

    notification_type = models.CharField(
        max_length=30,
        choices=TYPE_CHOICES,
    )

    title = models.CharField(
        max_length=100
    )

    message = models.CharField(
        max_length=255
    )

    redirect_url = models.CharField(
        max_length=150,
        blank=True,
        default=""
    )

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.recipient.username} - {self.title}"
    
# Stores comprehensive, sectioned strategic analysis reports generated specifically for startup profiles.
class StartupAnalysis(models.Model):
    startup = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='analysis'
    )

    market_analysis = models.TextField(blank=True)
    swot_analysis = models.TextField(blank=True)
    financial_roadmap = models.TextField(blank=True)
    growth_strategy = models.TextField(blank=True)

    target_audience = models.TextField(blank=True)
    revenue_model = models.TextField(blank=True)
    competition_analysis = models.TextField(blank=True)
    marketing_tactics = models.TextField(blank=True)
    operational_plan = models.TextField(blank=True)
    risk_assessment = models.TextField(blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Analysis for {self.startup.username}"
    
    
# Records financial investment transactions made by investors towards specific startup campaigns.
class Investment(models.Model):
    investor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="investments"
    )

    startup = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="received_investments"
    )

    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2
    )

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.investor.username} invested ₹{self.amount} in {self.startup.username}"



from django.conf import settings

# Manages the administrative blocking status, reasons, and audit trails for user accounts.
class UserBlock(models.Model):

    STATUS_CHOICES = [
        ("active", "Active"),
        ("blocked", "Blocked"),
    ]

    profile = models.OneToOneField(
        Profile,
        on_delete=models.CASCADE,
        related_name="block_info"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active"
    )

    reason = models.CharField(
        max_length=255,
        blank=True
    )

    description = models.TextField(
        blank=True
    )

    blocked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="blocked_users"
    )

    blocked_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    # Indicates whether the user profile is currently blocked.
    @property
    def is_blocked(self):
        return self.status == "blocked"

    # Sets the profile status to blocked and records the administrative action details.
    def block(self, admin_user, reason="", description=""):
        self.status = "blocked"
        self.reason = reason
        self.description = description
        self.blocked_by = admin_user
        self.blocked_at = timezone.now()
        self.save()

    # Restores the profile status to active and clears previous administrative block details.
    def unblock(self):
        self.status = "active"
        self.reason = ""
        self.description = ""
        self.blocked_at = None
        self.save()

    def __str__(self):
        return f"{self.profile.user.username} ({self.status})" 
 
    
# Represents a user's formal appeal against an administrative account block for review.
class Appeal(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    block = models.ForeignKey(
        UserBlock,
        on_delete=models.CASCADE,
        related_name="appeals"
    )

    message = models.TextField()

    admin_reply = models.TextField(
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    resolved_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.block.profile.user.username} - {self.status}"   
    
    