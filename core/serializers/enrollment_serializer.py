from rest_framework import serializers
from core.models import Enrollment


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = [
            "id",
            "student",
            "course",
            "status",
            "enrolled_at",
            "updated_at",
        ]
        read_only_fields = ["id", "enrolled_at", "updated_at"]

    def validate(self, data):
        """
        Ensure (student, course) is unique with a friendly error.
        """
        student = data.get("student", getattr(self.instance, "student", None))
        course = data.get("course", getattr(self.instance, "course", None))

        if student and course:
            qs = Enrollment.objects.filter(student=student, course=course)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {"non_field_errors": ["This student is already enrolled in that course."]}
                )
        return data
