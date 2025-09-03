from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from core.models import Grade


class GradeSerializer(serializers.ModelSerializer):
    student_id = serializers.IntegerField(source="enrollment.student_id", read_only=True)
    student_name = serializers.CharField(source="enrollment.student.full_name", read_only=True)
    course_id = serializers.IntegerField(source="enrollment.course_id", read_only=True)
    course_title = serializers.CharField(source="enrollment.course.title", read_only=True)
    assessment_title = serializers.CharField(source="assessment.title", read_only=True)
    max_marks = serializers.DecimalField(source="assessment.max_marks", read_only=True, max_digits=6, decimal_places=2)

    class Meta:
        model = Grade
        fields = [
            "id",
            "enrollment",
            "assessment",
            "score",
            "graded_at",
            "grader",
            # helpful read-onlys
            "student_id",
            "student_name",
            "course_id",
            "course_title",
            "assessment_title",
            "max_marks",
        ]
        read_only_fields = ["graded_at"]
        validators = [
            UniqueTogetherValidator(
                queryset=Grade.objects.all(),
                fields=("enrollment", "assessment"),
                message="Score for this assessment is already recorded for this enrollment.",
            )
        ]

    def validate(self, attrs):
        """
        Validate course/semester consistency and score bounds.
        """
        enrollment = attrs.get("enrollment") or getattr(self.instance, "enrollment", None)
        assessment = attrs.get("assessment") or getattr(self.instance, "assessment", None)
        score = attrs.get("score", getattr(self.instance, "score", None))

        errors = {}

        if enrollment and assessment:
            if enrollment.course_id != assessment.course_id:
                errors["assessment"] = "Assessment course must match enrollment course."
            if str(enrollment.semester) != str(assessment.semester):
                errors["assessment"] = "Assessment semester must match enrollment semester."

        if score is None:
            errors["score"] = "Score is required."
        elif score < 0:
            errors["score"] = "Score cannot be negative."
        elif assessment and assessment.max_marks is not None and score > assessment.max_marks:
            errors["score"] = f"Score cannot exceed max marks ({assessment.max_marks})."

        if errors:
            raise serializers.ValidationError(errors)
        return attrs
