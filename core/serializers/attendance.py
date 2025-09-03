from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from core.models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    student_id = serializers.IntegerField(source="enrollment.student_id", read_only=True)
    student_name = serializers.CharField(source="enrollment.student.full_name", read_only=True)
    course_id = serializers.IntegerField(source="enrollment.course_id", read_only=True)
    course_title = serializers.CharField(source="enrollment.course.title", read_only=True)
    date = serializers.DateField(source="session.date", read_only=True)

    class Meta:
        model = Attendance
        fields = [
            "id",
            "enrollment",
            "session",
            "status",
            "marked_at",
            "marker",
            # helpful read-onlys
            "student_id",
            "student_name",
            "course_id",
            "course_title",
            "date",
        ]
        read_only_fields = ["marked_at"]
        validators = [
            UniqueTogetherValidator(
                queryset=Attendance.objects.all(),
                fields=("enrollment", "session"),
                message="Attendance already recorded for this enrollment and session.",
            )
        ]

    def validate(self, attrs):
        enrollment = attrs.get("enrollment") or getattr(self.instance, "enrollment", None)
        session = attrs.get("session") or getattr(self.instance, "session", None)

        if enrollment and session:
            if enrollment.course_id != session.course_id:
                raise serializers.ValidationError(
                    {"session": "Session course must match enrollment course."}
                )
            if str(enrollment.semester) != str(session.semester):
                raise serializers.ValidationError(
                    {"session": "Session semester must match enrollment semester."}
                )
        return attrs
