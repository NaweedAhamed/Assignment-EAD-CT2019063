from django.db import models
from django.core.exceptions import ValidationError


class CourseSession(models.Model):
    """
    A single teaching session for a course & semester.
    """
    course = models.ForeignKey(
        "core.Course", on_delete=models.CASCADE, related_name="sessions"
    )
    semester = models.CharField(max_length=8)  # "1".."8"
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=128, blank=True, default="")
    notes = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["course", "semester", "date", "start_time"],
                name="uniq_session_course_sem_date_start",
            )
        ]
        ordering = ["-date", "-start_time", "-id"]

    def __str__(self):
        return f"{self.course} · S{self.semester} · {self.date} {self.start_time}-{self.end_time}"

    def clean(self):
        if self.end_time <= self.start_time:
            raise ValidationError({"end_time": "End time must be after start time."})
