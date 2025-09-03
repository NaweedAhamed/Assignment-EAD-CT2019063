from django.db import models
from django.core.exceptions import ValidationError


class Assessment(models.Model):
    TYPE_CHOICES = [
        ("quiz", "Quiz"),
        ("assignment", "Assignment"),
        ("mid", "Midterm"),
        ("final", "Final"),
        ("other", "Other"),
    ]

    course = models.ForeignKey(
        "core.Course", on_delete=models.CASCADE, related_name="assessments"
    )
    semester = models.CharField(max_length=8)  # "1".."8"
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=16, choices=TYPE_CHOICES, default="other")
    weight = models.DecimalField(max_digits=5, decimal_places=2)     # e.g., 30.00 (%)
    max_marks = models.DecimalField(max_digits=6, decimal_places=2)  # e.g., 100.00
    due_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["course", "semester", "title"],
                name="uniq_assessment_course_sem_title",
            )
        ]
        ordering = ["due_date", "id"]

    def __str__(self):
        return f"{self.course} · S{self.semester} · {self.title}"

    def clean(self):
        # Basic sanity
        if self.weight is None or self.weight <= 0 or self.weight > 100:
            raise ValidationError({"weight": "Weight must be > 0 and ≤ 100."})
        if self.max_marks is None or self.max_marks <= 0:
            raise ValidationError({"max_marks": "Max marks must be > 0."})
