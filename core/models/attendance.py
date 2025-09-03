from django.db import models
from django.core.exceptions import ValidationError


class Attendance(models.Model):
    STATUS_CHOICES = [
        ("present", "Present"),
        ("absent", "Absent"),
        ("late", "Late"),
        ("excused", "Excused"),
    ]

    enrollment = models.ForeignKey(
        "core.Enrollment", on_delete=models.CASCADE, related_name="attendance"
    )
    session = models.ForeignKey(
        "core.CourseSession", on_delete=models.CASCADE, related_name="attendance"
    )
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="present")
    marked_at = models.DateTimeField(auto_now=True)
    marker = models.CharField(max_length=255, blank=True, default="")  # optional: who marked

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["enrollment", "session"],
                name="uniq_attendance_enrollment_session",
            )
        ]
        ordering = ["-marked_at", "-id"]

    def __str__(self):
        return f"{self.enrollment} · {self.session.date} → {self.status}"

    def clean(self):
        """
        Ensure the session's course & semester match the enrollment's.
        """
        if self.enrollment_id and self.session_id:
            if self.enrollment.course_id != self.session.course_id:
                raise ValidationError(
                    {"session": "Session course must match enrollment course."}
                )
            if str(self.enrollment.semester) != str(self.session.semester):
                raise ValidationError(
                    {"session": "Session semester must match enrollment semester."}
                )
