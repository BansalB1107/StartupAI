from rest_framework import serializers
from .models import Report


# Serializes lightweight report metadata for efficient listing in the user report history view.
class ReportListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for the report history list.
    Excludes the full report_json to keep responses fast.
    """

    id = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id',
            'startup_name',
            'industry',
            'report_title',
            'premium',
            'favorite',
            'created_at',
            'updated_at',
        ]

    # Extracts and returns the report primary key as a string for API responses.
    def get_id(self, obj):
        return str(obj.pk)


# Serializes comprehensive report details including the complete AI-generated JSON analysis for detailed viewing.
class ReportDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer that includes the complete report_json.
    Used when viewing a single saved report.
    """

    id = serializers.SerializerMethodField()
    report_json = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id',
            'startup_name',
            'industry',
            'pitch',
            'report_title',
            'report_json',
            'premium',
            'favorite',
            'created_at',
            'updated_at',
        ]

    # Extracts and returns the report primary key as a string for API responses.
    def get_id(self, obj):
        return str(obj.pk)

    # Parses the stored JSON string back into a structured dictionary for API consumption.
    def get_report_json(self, obj):
        """Parse the stored JSON string back into a dict for the frontend."""
        import json
        try:
            return json.loads(obj.report_json)
        except (json.JSONDecodeError, TypeError):
            return obj.report_json
