from rest_framework import serializers
from core.models import Enrollment
from core.serializers.course_serializers import CourseBriefSerializer


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


class MyCourseSerializer(serializers.ModelSerializer):
    course = CourseBriefSerializer()

    class Meta:
        model = Enrollment
        fields = ["id", "course", "status"]


class RosterEntrySerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    student_email = serializers.EmailField(source="student.email", read_only=True)
    index_no = serializers.CharField(source="student.index_no", read_only=True)

    class Meta:
        model = Enrollment
        fields = ["id", "student_name", "student_email", "index_no", "status"]
