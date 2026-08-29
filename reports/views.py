import logging
import os

from django.conf import settings
from django.http import HttpResponse
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .pdf_service import get_or_create_pdf, _sanitize_filename
from .report_email_service import send_report_email
from .serializers import ReportDetailSerializer, ReportListSerializer
from . import services

logger = logging.getLogger(__name__)


# API endpoint that returns a paginated and searchable list of reports for the authenticated user.
class ReportListView(APIView):
    """
    GET /api/reports/
    Returns paginated list of user's reports (newest first, favorites pinned).
    Supports ?search= and ?page= query params.
    """
    permission_classes = [IsAuthenticated]

    # Handles GET requests to retrieve user reports with pagination and optional search filtering applied.
    def get(self, request):
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        search = request.query_params.get('search', '').strip() or None

        reports, total_count, total_pages = services.get_user_reports(
            user=request.user,
            page=page,
            page_size=page_size,
            search=search,
        )

        serializer = ReportListSerializer(reports, many=True)

        return Response({
            'reports': serializer.data,
            'total': total_count,
            'page': page,
            'total_pages': total_pages,
        })


# API endpoint that retrieves the complete details and generated JSON for a single specific report.
class ReportDetailView(APIView):
    """
    GET /api/reports/<id>/
    Returns a single report with full JSON data.
    """
    permission_classes = [IsAuthenticated]

    # Handles GET requests to fetch and serialize a specific report belonging to the user.
    def get(self, request, report_id):
        report = services.get_report_detail(request.user, report_id)

        if not report:
            return Response(
                {'error': 'Report not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ReportDetailSerializer(report)
        return Response(serializer.data)


# API endpoint responsible for soft-deleting a specific report from the user's history.
class ReportDeleteView(APIView):
    """
    DELETE /api/reports/<id>/
    Soft-deletes a report (sets deleted=True).
    """
    permission_classes = [IsAuthenticated]

    # Handles DELETE requests to mark a specific user report as deleted in the database.
    def delete(self, request, report_id):
        success = services.soft_delete_report(request.user, report_id)

        if not success:
            return Response(
                {'error': 'Report not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({'message': 'Report deleted successfully'})


# API endpoint that allows users to toggle the favorite status of a specific report.
class ReportFavoriteView(APIView):
    """
    PATCH /api/reports/<id>/favorite/
    Toggles the favorite status.
    """
    permission_classes = [IsAuthenticated]

    # Handles PATCH requests to toggle and return the updated favorite status of a report.
    def patch(self, request, report_id):
        new_status, success = services.toggle_favorite(request.user, report_id)

        if not success:
            return Response(
                {'error': 'Report not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            'message': 'Favorite updated',
            'favorite': new_status,
        })


# API endpoint that permits authenticated users to update the title of a saved report.
class ReportRenameView(APIView):
    """
    PATCH /api/reports/<id>/rename/
    Renames a report.
    Expects: { "title": "New Title" }
    """
    permission_classes = [IsAuthenticated]

    # Handles PATCH requests to validate and apply a new title to a specific report.
    def patch(self, request, report_id):
        new_title = request.data.get('title', '')

        if not new_title or not new_title.strip():
            return Response(
                {'error': 'Title is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        title, success = services.rename_report(request.user, report_id, new_title)

        if not success:
            return Response(
                {'error': 'Report not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            'message': 'Report renamed successfully',
            'report_title': title,
        })


# API endpoint that streams the cached PDF document for a specific report to the user.
class ReportDownloadView(APIView):
    """
    GET /api/reports/<id>/download/
    Stream the cached PDF for a specific report.
    Generates PDF on first request if not cached.
    Never calls Gemini — uses stored report_json only.
    """
    permission_classes = [IsAuthenticated]

    # Handles GET requests to locate and securely stream a requested PDF file for download.
    def get(self, request, report_id):
        report = services.get_report_detail(request.user, report_id)

        if not report:
            return Response(
                {'error': 'Report not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            # Get or create cached PDF
            pdf_relative_path = get_or_create_pdf(report)
            pdf_full_path = os.path.join(settings.MEDIA_ROOT, pdf_relative_path)

            if not os.path.exists(pdf_full_path):
                return Response(
                    {'error': 'PDF file not found. Please try again.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            # Build download filename
            safe_name = _sanitize_filename(report.startup_name or "Report")
            date_str = report.created_at.strftime("%Y-%m-%d") if report.created_at else "report"
            filename = f"{safe_name}_Report_{date_str}.pdf"

            # Stream the file
            with open(pdf_full_path, "rb") as pdf_file:
                response = HttpResponse(pdf_file.read(), content_type="application/pdf")
                response["Content-Disposition"] = f'attachment; filename="{filename}"'
                return response

        except Exception as e:
            logger.exception("PDF download error for report %s", report_id)
            return Response(
                {'error': 'Failed to generate PDF. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# API endpoint that triggers the dispatch of a report PDF via email to the user.
class ReportEmailView(APIView):
    """
    POST /api/reports/<id>/email/
    Email the report PDF to the user's registered email.
    Never calls Gemini — uses stored report_json only.
    """
    permission_classes = [IsAuthenticated]

    # Handles POST requests to send an email containing the specified report PDF as an attachment.
    def post(self, request, report_id):
        report = services.get_report_detail(request.user, report_id)

        if not report:
            return Response(
                {'error': 'Report not found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            send_report_email(report)
            return Response({
                'message': 'Report emailed successfully',
                'email': request.user.email,
            })
        except ValueError as ve:
            return Response(
                {'error': str(ve)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.exception("Email report error for report %s", report_id)
            return Response(
                {'error': 'Failed to send email. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# API endpoint providing a convenient shortcut to download the user's most recently generated report.
class LatestReportDownloadView(APIView):
    """
    GET /api/reports/latest/download/
    Download the user's most recent report as PDF.
    """
    permission_classes = [IsAuthenticated]

    # Handles GET requests to automatically find and stream the latest report PDF for download.
    def get(self, request):
        from .models import Report
        report = Report.objects.filter(
            user=request.user, deleted=False
        ).order_by('-created_at').first()

        if not report:
            return Response(
                {'error': 'No reports found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            pdf_relative_path = get_or_create_pdf(report)
            pdf_full_path = os.path.join(settings.MEDIA_ROOT, pdf_relative_path)

            if not os.path.exists(pdf_full_path):
                return Response(
                    {'error': 'PDF file not found. Please try again.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            safe_name = _sanitize_filename(report.startup_name or "Report")
            date_str = report.created_at.strftime("%Y-%m-%d") if report.created_at else "report"
            filename = f"{safe_name}_Report_{date_str}.pdf"

            with open(pdf_full_path, "rb") as pdf_file:
                response = HttpResponse(pdf_file.read(), content_type="application/pdf")
                response["Content-Disposition"] = f'attachment; filename="{filename}"'
                return response

        except Exception as e:
            logger.exception("Latest PDF download error")
            return Response(
                {'error': 'Failed to generate PDF. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# API endpoint providing a convenient shortcut to email the user's most recently generated report.
class LatestReportEmailView(APIView):
    """
    POST /api/reports/latest/email/
    Email the user's most recent report.
    """
    permission_classes = [IsAuthenticated]

    # Handles POST requests to automatically find and email the latest report PDF to the user.
    def post(self, request):
        from .models import Report
        report = Report.objects.filter(
            user=request.user, deleted=False
        ).order_by('-created_at').first()

        if not report:
            return Response(
                {'error': 'No reports found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            send_report_email(report)
            return Response({
                'message': 'Report emailed successfully',
                'email': request.user.email,
            })
        except ValueError as ve:
            return Response(
                {'error': str(ve)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.exception("Latest report email error")
            return Response(
                {'error': 'Failed to send email. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
