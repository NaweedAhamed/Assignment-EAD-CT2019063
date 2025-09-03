from decimal import Decimal
from django.db import models
from django.core.exceptions import ValidationError


class Grade(models.Model):
    enrollment = models.ForeignKey(
        "core.Enrollment", on_delete=models.CASCADE, related_name="grades"
    )
    assessment = models.ForeignKey(
        "core.Assessment", on_delete=models.CASCADE, related_name="grades"
    )
    score = models.DecimalField(max_digits=6, decimal_places=2, default=Decimal("0.00"))
    graded_at = models.DateTimeField(auto_now=True)
    grader = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["enrollment", "assessment"],
                name="uniq_grade_enrollment_assessment",
            )
        ]
        ordering = ["assessment_id", "id"]

    def __str__(self):
        return f"{self.enrollment} · {self.assessment} = {self.score}"

    def clean(self):
        # Keep course/semester consistent across enrollment and assessment
        enr = self.enrollment
        asmt = self.assessment
        if enr and asmt:
            if enr.course_id != asmt.course_id:
                raise ValidationError(
                    {"assessment": "Assessment course must match enrollment course."}
                )
            if str(enr.semester) != str(asmt.semester):
                raise ValidationError(
                    {"assessment": "Assessment semester must match enrollment semester."}
                )

            if self.score is None:
                raise ValidationError({"score": "Score is required."})
            if self.score < 0:
                raise ValidationError({"score": "Score cannot be negative."})
            if asmt.max_marks is not None and self.score > asmt.max_marks:
                raise ValidationError(
                    {"score": f"Score cannot exceed max marks ({asmt.max_marks})."}
                )
