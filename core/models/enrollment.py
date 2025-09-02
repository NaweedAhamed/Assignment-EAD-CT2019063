from django.db import models


class Enrollment(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("dropped", "Dropped"),
    ]

    student = models.ForeignKey(
        "core.Student",
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    course = models.ForeignKey(
        "core.Course",
        on_delete=models.CASCADE,
        related_name="enrollments",
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")
    enrolled_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "course")   # prevent duplicate enrollments
        ordering = ["-enrolled_at"]
        verbose_name = "Enrollment"
        verbose_name_plural = "Enrollments"

    def __str__(self) -> str:
        return f"{self.student.index_no} → {self.course.code} ({self.status})"
