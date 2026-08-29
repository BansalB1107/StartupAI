from django.db import models
from django.conf import settings
from django.utils import timezone


# Represents a saved AI-generated report containing startup analysis, user details, and metadata.
class Report(models.Model):
    """
    Stores every AI-generated startup report permanently.
    Designed for ChatGPT-like history: browse, search, favorite, soft-delete.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports',
    )

    # Startup context captured at generation time
    startup_name = models.CharField(max_length=200)
    industry = models.CharField(max_length=100)
    pitch = models.TextField()

    # The full Gemini JSON response — stored as text for MongoDB compatibility
    report_json = models.TextField()

    # User-editable title (defaults to startup_name at creation)
    report_title = models.CharField(max_length=300, blank=True)

    # Snapshot of premium status at generation time
    premium = models.BooleanField(default=False)

    # Cached PDF path (relative to MEDIA_ROOT)
    pdf_path = models.CharField(max_length=500, blank=True, null=True)

    # User interactions
    favorite = models.BooleanField(default=False)
    deleted = models.BooleanField(default=False)

    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'deleted']),
        ]

    # Returns a readable string representation of the report using its title and username.
    def __str__(self):
        return f"{self.report_title or self.startup_name} — {self.user.username}"

    # Overrides save method to automatically assign a default report title before database insertion.
    def save(self, *args, **kwargs):
        # Auto-set report_title from startup_name if not provided
        if not self.report_title:
            self.report_title = f"{self.startup_name} Analysis"
        super().save(*args, **kwargs)
