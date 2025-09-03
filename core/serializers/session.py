from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from core.models import CourseSession


class CourseSessionSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = CourseSession
        fields = [
            "id",
            "course",
            "course_title",
            "semester",
            "date",
            "start_time",
            "end_time",
            "room",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
        validators = [
            UniqueTogetherValidator(
                queryset=CourseSession.objects.all(),
                fields=("course", "semester", "date", "start_time"),
                message="A session with the same course, semester, date, and start time already exists.",
            )
        ]

    def validate(self, attrs):
        start = attrs.get("start_time", getattr(self.instance, "start_time", None))
        end = attrs.get("end_time", getattr(self.instance, "end_time", None))
        if start and end and end <= start:
            raise serializers.ValidationError(
                {"end_time": "End time must be after start time."}
            )
        return attrs
