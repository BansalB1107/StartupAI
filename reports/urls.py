from django.urls import path
from .views import (
    ReportListView,
    ReportDetailView,
    ReportDeleteView,
    ReportFavoriteView,
    ReportRenameView,
    ReportDownloadView,
    ReportEmailView,
    LatestReportDownloadView,
    LatestReportEmailView,
)

urlpatterns = [
    path('', ReportListView.as_view(), name='report-list'),

    # Latest report shortcuts (must come before <str:report_id>/ to avoid conflict)
    path('latest/download/', LatestReportDownloadView.as_view(), name='report-latest-download'),
    path('latest/email/', LatestReportEmailView.as_view(), name='report-latest-email'),

    # Individual report actions
    path('<str:report_id>/', ReportDetailView.as_view(), name='report-detail'),
    path('<str:report_id>/delete/', ReportDeleteView.as_view(), name='report-delete'),
    path('<str:report_id>/favorite/', ReportFavoriteView.as_view(), name='report-favorite'),
    path('<str:report_id>/rename/', ReportRenameView.as_view(), name='report-rename'),
    path('<str:report_id>/download/', ReportDownloadView.as_view(), name='report-download'),
    path('<str:report_id>/email/', ReportEmailView.as_view(), name='report-email'),
]
