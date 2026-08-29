from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    AdminBlockUserView, AdminDashboardStatsView, AdminUnblockUserView, AdminUserListView, MyBlockStatusView, NotificationCountView, PublicStartupProfileView, RegisterView, 
    MyTokenObtainPairView, ProfileDetailView, ResolveAppealView, SendAppealView, StartupListView,
    WalletTransactionView, ConnectionRequestView, StartupAnalyticsView, 
    InvestorProfileView, MessageListView, SendMessageView, 
    MyProfileView, InvestorStartupFeedView, GenerateAnalysisView,DashboardStatsView,
    InvestView,PortfolioView,StartupFundingView,VerifyOTPView,ResendOTPView,
    SendLoginOTPView,VerifyLoginOTPView,CreateOrderView,PaymentSuccessView,NotificationListView,
    PredictFundingView,AdminVerificationView,AdminAppealListView,AcceptInvestmentView,
    RejectInvestmentView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Combined profile paths
    path('profile/', ProfileDetailView.as_view(), name='profile-detail'),
    path('my-profile/', MyProfileView.as_view(), name='my-profile'),
    
    path('startups/', StartupListView.as_view(), name='startup-list'),
    path('wallet/', WalletTransactionView.as_view(), name='user-wallet'),
    path('connections/', ConnectionRequestView.as_view(), name='connections'),
    path('analytics/', StartupAnalyticsView.as_view(), name='startup-analytics'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path("notifications/count/",NotificationCountView.as_view(), name="notification-count",),
    
    path('investor-profile/<str:investor_id>/', InvestorProfileView.as_view(), name='investor-profile'),
    path('startup-profile/<str:startup_id>/', PublicStartupProfileView.as_view(), name='public-startup-profile'),
    
    path('messages/send/', SendMessageView.as_view(), name='send-message'),
    path('messages/<str:other_user_id>/', MessageListView.as_view(), name='get-messages'),
    
    path('investor/feed/', InvestorStartupFeedView.as_view(), name='investor-feed'),
    path('generate-analysis/', GenerateAnalysisView.as_view(), name='generate-analysis'),
    path("dashboard-stats/", DashboardStatsView.as_view()),
    
    path(
    "investments/<str:investment_id>/accept/",
    AcceptInvestmentView.as_view(),
),
path(
    "investments/<str:investment_id>/reject/",
    RejectInvestmentView.as_view(),
),
    
    
    path("invest/", InvestView.as_view()),
    
    path("portfolio/", PortfolioView.as_view()),
    
    path("funding/", StartupFundingView.as_view()),
    path(
        'create-order/',
        CreateOrderView.as_view(),
        name='create-order'
    ),
    path(
        'payment-success/',
        PaymentSuccessView.as_view(),
        name='payment-success'
    ),
    path('send-login-otp/',SendLoginOTPView.as_view(),name='send-login-otp'),

    path('verify-login-otp/',VerifyLoginOTPView.as_view(),name='verify-login-otp'),

    path('predict-funding/', PredictFundingView.as_view(), name='predict-funding'),
    
    path("admin-verify/", AdminVerificationView.as_view(), name="admin-verify"),
    
    path("admin-dashboard-stats/", AdminDashboardStatsView.as_view(),),
    
    path("admin/block-user/",AdminBlockUserView.as_view()),

    path("admin/unblock-user/",AdminUnblockUserView.as_view()),
    
    path("my-block-status/",MyBlockStatusView.as_view()),
    
    path("send-appeal/",SendAppealView.as_view()),

    path("admin/appeals/",AdminAppealListView.as_view()),

    path("admin/appeals/<int:appeal_id>/",ResolveAppealView.as_view()),
    
    path("admin/users/",AdminUserListView.as_view(),),
]