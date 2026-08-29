import logging

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Investment, Profile

logger = logging.getLogger(__name__)


# Handles the serialization and creation of core user accounts with disabled password logins.
class UserSerializer(serializers.ModelSerializer):

    role = serializers.CharField(
        write_only=True,
        required=False,
        default='startup'
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

    # Creates a new user account, disables direct password login, and initializes the profile.
    def create(self, validated_data):

        role = validated_data.pop('role', 'startup')

        # Create user with random unusable password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email']
        )

        # Disable password login
        user.set_unusable_password()
        user.save()

        Profile.objects.create(
            user=user,
            role=role
        )

        return user
    

    # Ensures the provided email address is unique across the entire user database.
    def validate_email(self, value):

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "An account with the provided email or username already exists."
            )

        return value


# Customizes JWT token generation to include the user's role and enforce email verification.
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    # Extends standard JWT generation by appending the user's role to the token payload.
    @classmethod
    def get_token(cls, user):

        token = super().get_token(user)

        try:
            token['role'] = user.profile.role
        except Exception:
            token['role'] = 'startup'

        return token

    # Validates authentication credentials and explicitly blocks access for unverified email accounts.
    def validate(self, attrs):

        data = super().validate(attrs)

        user = self.user

        # Check email verification
        if not user.profile.is_verified:

            raise serializers.ValidationError(
                "Please verify your email before logging in."
            )

        data['role'] = user.profile.role

        return data


# Manages comprehensive profile updates including basic info, premium status, and ML features.
class ProfileUpdateSerializer(serializers.ModelSerializer):
    # Explicitly configure decimal fields to handle blank optional form inputs safely:
    funding_goal = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    investment_budget = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)

    # ML input decimal fields
    market_size_billion = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    burn_rate_rupees = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True)
    monthly_revenue_rupees = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True)

    # ML output fields (read-only — only set by the prediction API)
    funding_readiness_score = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    prediction_confidence = serializers.CharField(read_only=True)
    prediction_label = serializers.CharField(read_only=True)
    ai_prediction_summary = serializers.CharField(read_only=True)
    last_prediction = serializers.DateTimeField(read_only=True)
    
    # Premium fields
    remaining_days = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Profile
        fields = [
            'is_profile_complete', 'phone_number', 'company_name', 
            'industry', 'pitch_description', 'funding_goal', 
            'company_or_firm', 'investment_budget', 'interested_industries',
            'is_verified',
            'pitch_deck',
            'profile_picture',
            'is_premium',
            'subscription_type',
            'subscription_expiry',
            'reports_used',
            'remaining_days',
            # ML input fields
            'funding_rounds', 'founder_experience_years', 'team_size',
            'market_size_billion', 'product_traction_users',
            'burn_rate_rupees', 'monthly_revenue_rupees', 'founder_background',
            # ML output fields (read-only)
            'funding_readiness_score', 'prediction_confidence',
            'prediction_label', 'ai_prediction_summary', 'last_prediction',
        ]

    # Validates that the provided phone number consists of exactly ten numeric digits.
    def validate_phone_number(self, value):
        import re
        if value and not re.match(r'^\d{10}$', str(value)):
            raise serializers.ValidationError("Mobile number must be exactly 10 numeric digits.")
        return value

    # Calculates and returns the number of days remaining on an active premium subscription.
    def get_remaining_days(self, obj):
        if not obj.is_premium or not obj.subscription_expiry:
            return 0
        from django.utils import timezone
        now = timezone.localtime(timezone.now())
        expiry = timezone.localtime(obj.subscription_expiry)
        days = (expiry - now).days
        return max(0, days)


# Serializes investment transaction records including detailed associated investor and startup names.
class InvestmentSerializer(serializers.ModelSerializer):

    id = serializers.SerializerMethodField()
    investor = serializers.SerializerMethodField()
    startup = serializers.SerializerMethodField()

    investor_name = serializers.CharField(
        source="investor.username",
        read_only=True,
    )

    startup_name = serializers.SerializerMethodField()

    class Meta:
        model = Investment
        fields = [
            "id",
            "investor",
            "startup",
            "amount",
            "created_at",
            "investor_name",
            "startup_name",
        ]

    # Extracts and returns the investment primary key as a string for API responses.
    def get_id(self, obj):
        return str(obj.id)

    # Extracts and returns the associated investor's primary key as a string.
    def get_investor(self, obj):
        return str(obj.investor.id)

    # Extracts and returns the associated startup's primary key as a string.
    def get_startup(self, obj):
        return str(obj.startup.id)

    # Retrieves the startup's company name or falls back to the owner's username safely.
    def get_startup_name(self, obj):
        if hasattr(obj.startup, "profile") and obj.startup.profile.company_name:
            return obj.startup.profile.company_name
        return obj.startup.username
    
    
from .models import UserBlock, Appeal


# Serializes user block administrative records including read-only contextual profile information.
class UserBlockSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="profile.user.username", read_only=True)
    email = serializers.EmailField(source="profile.user.email", read_only=True)
    role = serializers.CharField(source="profile.role", read_only=True)

    class Meta:
        model = UserBlock
        fields = [
            "id",
            "username",
            "email",
            "role",
            "status",
            "reason",
            "description",
            "blocked_at",
        ]


# Serializes block appeal records for administrative review and user tracking purposes.
class AppealSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="block.profile.user.username",
        read_only=True
    )

    class Meta:
        model = Appeal
        fields = "__all__"