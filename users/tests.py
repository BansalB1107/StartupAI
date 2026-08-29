from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient


class AdminUserListViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_missing_profile_returns_forbidden_instead_of_server_error(self):
        user = User.objects.create_user(username="no_profile_user", email="noprofile@example.com")
        self.client.force_authenticate(user=user)

        response = self.client.get("/api/users/admin/users/")

        self.assertEqual(response.status_code, 403)
        self.assertIn("Only admin", response.json()["error"])
