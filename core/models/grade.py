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
        # Useful indexes for gradebook/result lookups
        indexes = [
            models.Index(fields=["enrollment"]),
            models.Index(fields=["assessment"]),
        ]
        ordering = ["assessment_id", "id"]

    def __str__(self):
        return f"{self.enrollment} · {self.assessment} = {self.score}"

    def clean(self):
        """
        Cross-model validation to ensure data consistency:
        - Assessment must belong to the same course as the enrollment.
        - (If available) semesters should match.
        - Score must be >= 0 and <= assessment.max_marks when provided.
        """
        enr = self.enrollment
        asmt = self.assessment

        if not enr or not asmt:
            # Let required-field validators handle None cases; nothing else to check here.
            return

        # 1) Course consistency (strict)
        if enr.course_id != asmt.course_id:
            raise ValidationError(
                {"assessment": "Assessment course must match enrollment course."}
            )

        # 2) Semester consistency (best-effort: use whatever is available)
        #    Prefer explicit fields; fall back to course.semester if needed.
        enr_sem = getattr(enr, "semester", None)
        if enr_sem is None:
            enr_sem = getattr(getattr(enr, "course", None), "semester", None)
        asmt_sem = getattr(asmt, "semester", None)
        if asmt_sem is None:
            asmt_sem = getattr(getattr(asmt, "course", None), "semester", None)

        if enr_sem is not None and asmt_sem is not None:
            if str(enr_sem) != str(asmt_sem):
                raise ValidationError(
                    {"assessment": "Assessment semester must match enrollment semester."}
                )

        # 3) Score validation
        if self.score is None:
            raise ValidationError({"score": "Score is required."})
        if self.score < 0:
            raise ValidationError({"score": "Score cannot be negative."})

        max_marks = getattr(asmt, "max_marks", None)
        if max_marks is not None and self.score > max_marks:
            raise ValidationError(
                {"score": f"Score cannot exceed max marks ({max_marks})."}
            )
