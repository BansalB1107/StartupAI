from django.apps import AppConfig


class ReportsConfig(AppConfig):
    default_auto_field = 'django_mongodb_backend.fields.ObjectIdAutoField'
    name = 'reports'
    verbose_name = 'AI Report History'
