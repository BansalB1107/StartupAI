"""
PDF Service — Generates premium ReportLab PDFs from stored report_json.
Never calls Gemini. Always uses saved data from MongoDB.
"""

import os
import json
import textwrap
from io import BytesIO
from datetime import datetime

from django.conf import settings

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether,
)
from reportlab.pdfgen import canvas


# ── Brand Colors ──────────────────────────────────────────────

PRIMARY = colors.HexColor("#6366F1")
PRIMARY_LIGHT = colors.HexColor("#818CF8")
PRIMARY_BG = colors.HexColor("#EEF2FF")
SECONDARY = colors.HexColor("#A855F7")
DARK = colors.HexColor("#0F172A")
TEXT_COLOR = colors.HexColor("#1E293B")
TEXT_LIGHT = colors.HexColor("#64748B")
SUCCESS = colors.HexColor("#10B981")
SUCCESS_BG = colors.HexColor("#ECFDF5")
ERROR = colors.HexColor("#EF4444")
ERROR_BG = colors.HexColor("#FEF2F2")
WARNING = colors.HexColor("#F59E0B")
WARNING_BG = colors.HexColor("#FFFBEB")
INFO_BG = colors.HexColor("#F0F9FF")
BORDER_COLOR = colors.HexColor("#E2E8F0")
WHITE = colors.white
PAGE_BG = colors.HexColor("#FAFBFD")


# ── Section Titles ────────────────────────────────────────────

SECTION_TITLES = {
    "executive_summary": "Executive Summary",
    "market_analysis": "Market Analysis",
    "swot_analysis": "SWOT Analysis",
    "financial_roadmap": "Financial Roadmap",
    "growth_strategy": "Growth Strategy",
    "target_audience": "Target Audience",
    "revenue_model": "Revenue Model",
    "competition_analysis": "Competition Analysis",
    "marketing_tactics": "Marketing Strategy",
    "operational_plan": "Operational Plan",
    "risk_assessment": "Risk Assessment",
    "investor_readiness": "Investor Readiness Score",
    "Investor_Readiness": "Investor Readiness Score",
    "Business_Model_Canvas": "Business Model Canvas",
    "MVP_Features": "MVP Features",
    "Funding_Strategy": "Funding Strategy",
}


# ── Custom Styles ─────────────────────────────────────────────

# Generates and registers custom typographic styles for various elements within the PDF document.
def _build_styles():
    """Create custom ParagraphStyles for the PDF."""
    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name="CoverTitle",
        fontName="Helvetica-Bold",
        fontSize=32,
        leading=40,
        textColor=DARK,
        alignment=TA_LEFT,
        spaceAfter=12,
    ))

    styles.add(ParagraphStyle(
        name="CoverSubtitle",
        fontName="Helvetica",
        fontSize=14,
        leading=20,
        textColor=TEXT_LIGHT,
        alignment=TA_LEFT,
        spaceAfter=6,
    ))

    styles.add(ParagraphStyle(
        name="CoverMeta",
        fontName="Helvetica",
        fontSize=11,
        leading=16,
        textColor=TEXT_LIGHT,
        alignment=TA_LEFT,
        spaceAfter=4,
    ))

    styles.add(ParagraphStyle(
        name="SectionTitle",
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=24,
        textColor=DARK,
        spaceBefore=24,
        spaceAfter=12,
    ))

    styles.add(ParagraphStyle(
        name="SubSectionTitle",
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=18,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
    ))

    styles.add(ParagraphStyle(
        name="BodyText2",
        fontName="Helvetica",
        fontSize=10.5,
        leading=16,
        textColor=TEXT_COLOR,
        alignment=TA_JUSTIFY,
        spaceAfter=8,
    ))

    styles.add(ParagraphStyle(
        name="BulletItem",
        fontName="Helvetica",
        fontSize=10.5,
        leading=16,
        textColor=TEXT_COLOR,
        leftIndent=20,
        spaceAfter=4,
        bulletIndent=8,
    ))

    styles.add(ParagraphStyle(
        name="FooterStyle",
        fontName="Helvetica",
        fontSize=8,
        textColor=TEXT_LIGHT,
        alignment=TA_CENTER,
    ))

    styles.add(ParagraphStyle(
        name="InfoBoxText",
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        textColor=TEXT_COLOR,
        spaceAfter=4,
    ))

    return styles


# ── Watermark + Footer Canvas ─────────────────────────────────

# Handles page headers, footers, watermarks, and numbering dynamically for different PDF pages.
class _PDFTemplate:
    """Handles page headers, footers, watermarks, and page numbers."""

    def __init__(self, startup_name):
        self.startup_name = startup_name
        self.page_count = 0

    # Renders the cover page specifically, ensuring only the watermark is drawn without headers or footers.
    def on_first_page(self, canvas_obj, doc):
        """Cover page — watermark only, no header/footer."""
        self._draw_watermark(canvas_obj, doc)

    # Renders subsequent content pages by drawing both the background watermark and the professional footer.
    def on_later_pages(self, canvas_obj, doc):
        """Content pages — watermark + footer."""
        self._draw_watermark(canvas_obj, doc)
        self._draw_footer(canvas_obj, doc)

    # Draws a subtle diagonal watermark text across the center of the PDF page.
    def _draw_watermark(self, canvas_obj, doc):
        """Draw subtle diagonal watermark text."""
        canvas_obj.saveState()
        canvas_obj.setFont("Helvetica", 54)
        canvas_obj.setFillColor(colors.HexColor("#6366F1"), alpha=0.04)
        canvas_obj.translate(A4[0] / 2, A4[1] / 2)
        canvas_obj.rotate(35)
        canvas_obj.drawCentredString(0, 0, "StartupAI")
        canvas_obj.restoreState()

    # Renders a professional footer containing branding, confidential notice, and the current page number.
    def _draw_footer(self, canvas_obj, doc):
        """Draw professional footer with page numbers and branding."""
        canvas_obj.saveState()

        page_num = doc.page
        width = A4[0]

        # Divider line
        canvas_obj.setStrokeColor(BORDER_COLOR)
        canvas_obj.setLineWidth(0.5)
        canvas_obj.line(40, 38, width - 40, 38)

        # Left: Branding
        canvas_obj.setFont("Helvetica", 7.5)
        canvas_obj.setFillColor(TEXT_LIGHT)
        canvas_obj.drawString(40, 25, "StartupAI AI  •  Confidential")

        # Center: Report name
        canvas_obj.setFont("Helvetica", 7.5)
        canvas_obj.drawCentredString(
            width / 2, 25,
            f"{self.startup_name} — Analysis Report"
        )

        # Right: Page number
        canvas_obj.setFont("Helvetica-Bold", 8)
        canvas_obj.setFillColor(PRIMARY)
        canvas_obj.drawRightString(width - 40, 25, f"Page {page_num}")

        canvas_obj.restoreState()


# ── PDF Builder ───────────────────────────────────────────────

# Constructs the visually appealing cover page featuring report metadata, titles, and confidential notices.
def _build_cover_page(story, styles, startup_name, industry, created_at, username):
    """Build the cover page."""

    # Top spacer
    story.append(Spacer(1, 1.5 * inch))

    # Accent bar
    accent_table = Table(
        [[""]],
        colWidths=[3 * inch],
        rowHeights=[4],
    )
    accent_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PRIMARY),
        ("LINEBELOW", (0, 0), (-1, -1), 0, WHITE),
    ]))
    story.append(accent_table)
    story.append(Spacer(1, 24))

    # Title
    story.append(Paragraph(startup_name, styles["CoverTitle"]))
    story.append(Paragraph("AI-Powered Strategic Analysis Report", styles["CoverSubtitle"]))

    story.append(Spacer(1, 30))

    # Gradient-like divider
    divider = HRFlowable(
        width="60%",
        thickness=2,
        color=PRIMARY,
        spaceAfter=30,
    )
    story.append(divider)

    # Metadata
    date_str = _format_date(created_at)
    meta_items = [
        f"<b>Industry:</b>  {industry}",
        f"<b>Generated:</b>  {date_str}",
        f"<b>Prepared For:</b>  {username}",
        f"<b>Prepared By:</b>  StartupAI AI",
    ]

    for item in meta_items:
        story.append(Paragraph(item, styles["CoverMeta"]))

    story.append(Spacer(1, 1.5 * inch))

    # Bottom info box
    info_data = [[Paragraph(
        "<b>CONFIDENTIAL</b> — This report was generated using artificial intelligence "
        "and is intended solely for the recipient named above. The analysis is based on "
        "the startup profile data provided at the time of generation.",
        ParagraphStyle(
            name="ConfNote",
            fontName="Helvetica",
            fontSize=8.5,
            leading=13,
            textColor=TEXT_LIGHT,
            alignment=TA_LEFT,
        )
    )]]

    info_table = Table(info_data, colWidths=[5.5 * inch])
    info_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PRIMARY_BG),
        ("BOX", (0, 0), (-1, -1), 0.5, PRIMARY_LIGHT),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ]))
    story.append(info_table)

    story.append(PageBreak())


# Orchestrates the layout of a single report section, adding a colored header and appropriate content.
def _build_section(story, styles, title, content):
    """Build a single report section with appropriate formatting."""

    # Section header with colored bar
    header_data = [[Paragraph(
        f"<font color='white'><b>{title}</b></font>",
        ParagraphStyle(
            name="SecHead",
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=20,
            textColor=WHITE,
            alignment=TA_LEFT,
        )
    )]]

    header_table = Table(header_data, colWidths=[7.1 * inch])
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PRIMARY),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("ROUNDEDCORNERS", [6, 6, 6, 6]),
    ]))

    story.append(Spacer(1, 16))
    story.append(header_table)
    story.append(Spacer(1, 14))

    # Render content based on type
    _render_content(story, styles, title, content)

    story.append(Spacer(1, 8))


# Dynamically renders section content based on its underlying data structure such as string, dict, or list.
def _render_content(story, styles, title, content):
    """Render section content based on data type (dict, list, string)."""

    if isinstance(content, str):
        # Try parsing as JSON first
        try:
            parsed = json.loads(content)
            _render_content(story, styles, title, parsed)
            return
        except (json.JSONDecodeError, TypeError):
            pass

        # Plain text — split into paragraphs
        _render_text(story, styles, content)

    elif isinstance(content, dict):
        # SWOT gets special treatment
        if "swot" in title.lower():
            _render_swot(story, styles, content)
        elif "risk" in title.lower():
            _render_risk_assessment(story, styles, content)
        else:
            _render_dict(story, styles, content)

    elif isinstance(content, list):
        _render_list(story, styles, content)

    else:
        story.append(Paragraph(str(content), styles["BodyText2"]))


# Processes plain text blocks, converting bold markers and formatting bullet points for display.
def _render_text(story, styles, text):
    """Render a text block, handling bold markers and bullet points."""
    if not text:
        return

    lines = text.split("\n")
    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Convert **bold** to <b>bold</b>
        line = _convert_bold(line)

        # Check if it's a bullet point
        if line.startswith(("- ", "• ", "* ")):
            bullet_text = line[2:].strip()
            story.append(Paragraph(
                f"•  {bullet_text}",
                styles["BulletItem"]
            ))
        elif len(line) > 2 and line[0].isdigit() and line[1] in ".)" and line[2] == " ":
            bullet_text = line[3:].strip()
            story.append(Paragraph(
                f"•  {bullet_text}",
                styles["BulletItem"]
            ))
        else:
            story.append(Paragraph(line, styles["BodyText2"]))


# Iterates through a list of items and renders them as properly indented bullet points.
def _render_list(story, styles, items):
    """Render a list as bullet points."""
    for item in items:
        if isinstance(item, dict):
            _render_dict(story, styles, item)
        elif isinstance(item, str):
            clean = _convert_bold(item.strip())
            story.append(Paragraph(f"•  {clean}", styles["BulletItem"]))
        else:
            story.append(Paragraph(f"•  {str(item)}", styles["BulletItem"]))


# Iterates through dictionary key-value pairs, formatting keys as sub-headers and recursively rendering values.
def _render_dict(story, styles, data):
    """Render a dictionary as sub-sections or a table."""
    for key, value in data.items():
        # Clean key for display
        display_key = key.replace("_", " ").title()

        story.append(Paragraph(
            f"<b>{display_key}</b>",
            styles["SubSectionTitle"]
        ))

        if isinstance(value, str):
            _render_text(story, styles, value)
        elif isinstance(value, list):
            _render_list(story, styles, value)
        elif isinstance(value, dict):
            _render_dict(story, styles, value)
        else:
            story.append(Paragraph(str(value), styles["BodyText2"]))


# Formats a SWOT analysis dictionary into a visually distinct, four-quadrant colored table structure.
def _render_swot(story, styles, swot_data):
    """Render SWOT analysis as a professional 4-quadrant colored table."""

    swot_config = {
        "strengths": {"color": SUCCESS, "bg": SUCCESS_BG, "icon": "✓"},
        "weaknesses": {"color": ERROR, "bg": ERROR_BG, "icon": "✗"},
        "opportunities": {"color": PRIMARY, "bg": PRIMARY_BG, "icon": "↗"},
        "threats": {"color": WARNING, "bg": WARNING_BG, "icon": "⚠"},
    }

    for category, items in swot_data.items():
        config = swot_config.get(category.lower(), {
            "color": PRIMARY, "bg": PRIMARY_BG, "icon": "•"
        })

        # Category header
        cat_header = [[Paragraph(
            f"<font color='white'><b>{category.upper()}</b></font>",
            ParagraphStyle(
                name=f"SWOT_{category}",
                fontName="Helvetica-Bold",
                fontSize=11,
                leading=16,
                textColor=WHITE,
            )
        )]]

        cat_table = Table(cat_header, colWidths=[7.1 * inch])
        cat_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), config["color"]),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("ROUNDEDCORNERS", [4, 4, 0, 0]),
        ]))
        story.append(cat_table)

        # Items
        if isinstance(items, list):
            rows = []
            for item in items:
                item_text = _convert_bold(str(item))
                rows.append([Paragraph(
                    f"{config['icon']}  {item_text}",
                    ParagraphStyle(
                        name=f"SWOTItem_{category}",
                        fontName="Helvetica",
                        fontSize=10,
                        leading=15,
                        textColor=TEXT_COLOR,
                        leftIndent=4,
                    )
                )])

            items_table = Table(rows, colWidths=[7.1 * inch])
            items_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), config["bg"]),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("BOX", (0, 0), (-1, -1), 0.5, config["color"]),
                ("ROUNDEDCORNERS", [0, 0, 4, 4]),
                ("LINEBELOW", (0, 0), (-1, -2), 0.3, BORDER_COLOR),
            ]))
            story.append(items_table)
        elif isinstance(items, str):
            _render_text(story, styles, items)

        story.append(Spacer(1, 10))


# Evaluates and visually highlights various risk factors based on severity using colored assessment cards.
def _render_risk_assessment(story, styles, risk_data):
    """Render risk assessment with severity indicators."""

    for risk_name, risk_text in risk_data.items():
        display_name = risk_name.replace("_", " ").title()

        # Determine severity
        lower_name = risk_name.lower()
        if any(w in lower_name for w in ["market", "financial", "high"]):
            severity = "HIGH"
            sev_color = ERROR
            sev_bg = ERROR_BG
        elif any(w in lower_name for w in ["legal", "low"]):
            severity = "LOW"
            sev_color = SUCCESS
            sev_bg = SUCCESS_BG
        else:
            severity = "MEDIUM"
            sev_color = WARNING
            sev_bg = WARNING_BG

        # Risk card
        header_row = [
            Paragraph(
                f"<b>{display_name}</b>",
                ParagraphStyle(name="RiskName", fontName="Helvetica-Bold",
                               fontSize=11, textColor=TEXT_COLOR)
            ),
            Paragraph(
                f"<b>{severity} RISK</b>",
                ParagraphStyle(name="RiskSev", fontName="Helvetica-Bold",
                               fontSize=9, textColor=sev_color, alignment=TA_RIGHT)
            ),
        ]

        risk_content = _convert_bold(str(risk_text)) if isinstance(risk_text, str) else str(risk_text)
        body_row = [
            Paragraph(risk_content,
                      ParagraphStyle(name="RiskBody", fontName="Helvetica",
                                     fontSize=10, leading=15, textColor=TEXT_COLOR)),
            "",
        ]

        risk_table = Table(
            [header_row, body_row],
            colWidths=[5 * inch, 2.1 * inch],
        )
        risk_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), sev_bg),
            ("BOX", (0, 0), (-1, -1), 0.5, sev_color),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("SPAN", (0, 1), (1, 1)),
            ("ROUNDEDCORNERS", [6, 6, 6, 6]),
        ]))

        story.append(risk_table)
        story.append(Spacer(1, 10))


# ── Utility Functions ─────────────────────────────────────────

# Replaces markdown-style double asterisk bold markers with HTML bold tags for PDF rendering.
def _convert_bold(text):
    """Convert **bold** markers to <b> tags for ReportLab."""
    import re
    return re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)


# Attempts to parse and format various date inputs into a standardized, human-readable date string.
def _format_date(date_val):
    """Format a date string or datetime object into readable format."""
    if isinstance(date_val, str):
        try:
            dt = datetime.fromisoformat(date_val.replace("Z", "+00:00"))
            return dt.strftime("%B %d, %Y")
        except (ValueError, TypeError):
            return date_val
    elif isinstance(date_val, datetime):
        return date_val.strftime("%B %d, %Y")
    return str(date_val) if date_val else "N/A"


# Sanitizes startup names by removing special characters and replacing spaces with underscores for filenames.
def _sanitize_filename(name):
    """Create a safe filename from a startup name."""
    import re
    safe = re.sub(r'[^\w\s-]', '', name).strip()
    safe = re.sub(r'[\s]+', '_', safe)
    return safe or "Report"


# ── Public API ────────────────────────────────────────────────

# Generates a premium PDF document dynamically from the stored report JSON and saves it locally.
def generate_pdf(report):
    """
    Generate a premium PDF from a Report model instance.

    Args:
        report: Report model instance with report_json, startup_name, etc.

    Returns:
        str: Relative file path to the generated PDF (relative to MEDIA_ROOT)
    """

    # Parse report data
    try:
        report_data = json.loads(report.report_json) if isinstance(report.report_json, str) else report.report_json
    except (json.JSONDecodeError, TypeError):
        report_data = {}

    # Extract the nested 'report' key if present (wrapped record format)
    inner_report = report_data.get("report", report_data)

    startup_name = report.startup_name or "Untitled Startup"
    industry = report.industry or "General"
    created_at = report.created_at
    username = report.user.username if report.user else "User"

    # Build file path
    safe_name = _sanitize_filename(startup_name)
    date_str = created_at.strftime("%Y-%m-%d") if created_at else datetime.now().strftime("%Y-%m-%d")
    filename = f"{safe_name}_Report_{date_str}.pdf"
    relative_dir = "generated_pdfs"
    relative_path = os.path.join(relative_dir, filename)

    # Ensure directory exists
    full_dir = os.path.join(settings.MEDIA_ROOT, relative_dir)
    os.makedirs(full_dir, exist_ok=True)
    full_path = os.path.join(settings.MEDIA_ROOT, relative_path)

    # Build styles
    styles = _build_styles()

    # Template for watermark + footer
    template = _PDFTemplate(startup_name)

    # Create document
    doc = SimpleDocTemplate(
        full_path,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=50,
        title=f"{startup_name} — AI Analysis Report",
        author="StartupAI AI",
        subject=f"Strategic Analysis for {startup_name}",
    )

    story = []

    # ── Cover Page ──
    _build_cover_page(story, styles, startup_name, industry, created_at, username)

    # ── Content Sections ──
    section_order = [
        "executive_summary",
        "market_analysis",
        "swot_analysis",
        "financial_roadmap",
        "growth_strategy",
        "target_audience",
        "revenue_model",
        "competition_analysis",
        "marketing_tactics",
        "operational_plan",
        "risk_assessment",
        "investor_readiness",
        "Investor_Readiness",
        "Business_Model_Canvas",
        "MVP_Features",
        "Funding_Strategy",
    ]

    rendered_keys = set()

    # Render in preferred order first
    for key in section_order:
        if key in inner_report and key not in rendered_keys:
            title = SECTION_TITLES.get(key, key.replace("_", " ").title())
            _build_section(story, styles, title, inner_report[key])
            rendered_keys.add(key)

    # Render any remaining keys
    for key, value in inner_report.items():
        if key not in rendered_keys and key not in ("title", "startup_name", "industry", "created_at", "premium"):
            title = SECTION_TITLES.get(key, key.replace("_", " ").title())
            _build_section(story, styles, title, value)

    # Build PDF
    doc.build(
        story,
        onFirstPage=template.on_first_page,
        onLaterPages=template.on_later_pages,
    )

    return relative_path


# Generates or retrieves a PDF file and loads it into a memory buffer for immediate streaming.
def generate_pdf_to_buffer(report):
    """
    Generate a PDF and return it as a BytesIO buffer (for streaming).
    This is used when we want to stream directly without file caching.

    Args:
        report: Report model instance

    Returns:
        tuple: (BytesIO buffer, filename string)
    """
    # For now, generate to file and read back
    # This ensures caching works
    relative_path = get_or_create_pdf(report)
    full_path = os.path.join(settings.MEDIA_ROOT, relative_path)

    safe_name = _sanitize_filename(report.startup_name or "Report")
    date_str = report.created_at.strftime("%Y-%m-%d") if report.created_at else datetime.now().strftime("%Y-%m-%d")
    filename = f"{safe_name}_Report_{date_str}.pdf"

    buf = BytesIO()
    with open(full_path, "rb") as f:
        buf.write(f.read())
    buf.seek(0)

    return buf, filename


# Retrieves the path of an existing cached PDF or generates a new one if missing.
def get_or_create_pdf(report):
    """
    Return the cached PDF path, or generate a new one if it doesn't exist.

    Args:
        report: Report model instance

    Returns:
        str: Relative file path to the PDF
    """
    # Check if cached PDF exists
    if report.pdf_path:
        full_path = os.path.join(settings.MEDIA_ROOT, report.pdf_path)
        if os.path.exists(full_path):
            return report.pdf_path

    # Generate new PDF
    relative_path = generate_pdf(report)

    # Cache the path on the model
    report.pdf_path = relative_path
    report.save(update_fields=["pdf_path"])

    return relative_path
