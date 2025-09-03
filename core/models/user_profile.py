from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    ROLE_STUDENT = "student"
    ROLE_TEACHER = "teacher"
    ROLE_ADMIN = "admin"

    ROLE_CHOICES = [
        (ROLE_STUDENT, "Student"),
        (ROLE_TEACHER, "Teacher"),
        (ROLE_ADMIN, "Admin"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_STUDENT)

    def __str__(self) -> str:
        return f"{self.user.username} ({self.role})"

    @property
    def is_student(self) -> bool:
        return self.role == self.ROLE_STUDENT

    @property
    def is_teacher(self) -> bool:
        return self.role == self.ROLE_TEACHER

    @property
    def is_admin(self) -> bool:
        return self.role == self.ROLE_ADMIN
