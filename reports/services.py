"""
Business logic for the Report History system.
All report operations are handled here — views stay thin.
"""

import json
import logging

from django.db.models import Q

from .models import Report

logger = logging.getLogger(__name__)


# Creates a new report record, stores AI analysis, and automatically triggers PDF generation.
def save_report(user, startup_name, industry, pitch, report_data, is_premium=False):
    """
    Save a new AI report to history after Gemini generates it.
    Called automatically from GenerateAnalysisView.

    Args:
        user: Django User instance
        startup_name: Company name from profile
        industry: Industry from profile
        pitch: Pitch description from profile
        report_data: The parsed JSON dict from Gemini
        is_premium: Whether user had premium at generation time

    Returns:
        Report instance
    """
    # Build the wrapped record with metadata + raw Gemini report
    title = f"{startup_name or 'Untitled Startup'} Analysis"

    wrapped_record = {
        "title": title,
        "startup_name": startup_name or "Untitled Startup",
        "industry": industry or "General",
        "created_at": None,  # Will be set after creation from model timestamp
        "premium": is_premium,
        "report": report_data if isinstance(report_data, dict) else {},
    }

    report_json_str = json.dumps(wrapped_record)

    report = Report.objects.create(
        user=user,
        startup_name=startup_name or "Untitled Startup",
        industry=industry or "General",
        pitch=pitch or "",
        report_json=report_json_str,
        premium=is_premium,
    )

    # Patch the created_at into the stored JSON now that we have the timestamp
    wrapped_record["created_at"] = report.created_at.isoformat()
    report.report_json = json.dumps(wrapped_record)
    report.save(update_fields=["report_json"])

    # Auto-generate PDF immediately so downloads/emails are instant
    try:
        from .pdf_service import generate_pdf
        pdf_path = generate_pdf(report)
        report.pdf_path = pdf_path
        report.save(update_fields=["pdf_path"])
    except Exception as pdf_err:
        # Don't fail the report save if PDF generation fails
        # PDF will be generated on first download/email instead
        logger.warning("Auto PDF generation failed: %s", pdf_err)

    return report


# Retrieves a paginated and optionally filtered list of reports belonging to the user.
def get_user_reports(user, page=1, page_size=10, search=None):
    """
    Fetch paginated reports for a user.
    Favorites first, then newest first.
    Excludes soft-deleted reports.

    Args:
        user: Django User instance
        page: Page number (1-indexed)
        page_size: Number of reports per page
        search: Optional search query string

    Returns:
        tuple: (queryset_page, total_count, total_pages)
    """
    queryset = Report.objects.filter(user=user, deleted=False)

    # Apply search filter
    if search:
        queryset = queryset.filter(
            Q(startup_name__icontains=search) |
            Q(industry__icontains=search) |
            Q(report_title__icontains=search) |
            Q(pitch__icontains=search)
        )

    # Order: favorites first, then newest
    queryset = queryset.order_by('-favorite', '-created_at')

    total_count = queryset.count()
    total_pages = max(1, (total_count + page_size - 1) // page_size)

    # Clamp page
    page = max(1, min(page, total_pages))

    start = (page - 1) * page_size
    end = start + page_size

    return queryset[start:end], total_count, total_pages


# Fetches a specific report instance ensuring it belongs to the authenticated user and exists.
def get_report_detail(user, report_id):
    """
    Fetch a single report, ensuring it belongs to the user.

    Returns:
        Report instance or None
    """
    try:
        return Report.objects.get(pk=report_id, user=user, deleted=False)
    except Report.DoesNotExist:
        return None


# Marks a specific report as deleted without removing the underlying database record entirely.
def soft_delete_report(user, report_id):
    """
    Soft-delete a report (mark deleted=True).

    Returns:
        True if deleted, False if not found
    """
    try:
        report = Report.objects.get(pk=report_id, user=user, deleted=False)
        report.deleted = True
        report.save(update_fields=['deleted', 'updated_at'])
        return True
    except Report.DoesNotExist:
        return False


# Toggles the favorite status of a specific report and updates the modification timestamp.
def toggle_favorite(user, report_id):
    """
    Toggle the favorite status of a report.

    Returns:
        (new_favorite_status, success)
    """
    try:
        report = Report.objects.get(pk=report_id, user=user, deleted=False)
        report.favorite = not report.favorite
        report.save(update_fields=['favorite', 'updated_at'])
        return report.favorite, True
    except Report.DoesNotExist:
        return False, False


# Updates the title of a specific user report and records the modification time.
def rename_report(user, report_id, new_title):
    """
    Rename a report.

    Returns:
        (new_title, success)
    """
    if not new_title or not new_title.strip():
        return None, False

    try:
        report = Report.objects.get(pk=report_id, user=user, deleted=False)
        report.report_title = new_title.strip()
        report.save(update_fields=['report_title', 'updated_at'])
        return report.report_title, True
    except Report.DoesNotExist:
        return None, False
