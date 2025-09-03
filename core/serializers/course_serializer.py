from rest_framework import serializers
from core.models import Course


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            "id",
            "code",
            "title",
            "description",
            "credits",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_credits(self, value):
        # keep it simple but sane
        if not (1 <= value <= 10):
            raise serializers.ValidationError("Credits must be between 1 and 10.")
        return value


class CourseBriefSerializer(serializers.ModelSerializer):
    """
    A lightweight version of Course for nested serializers (e.g., My Courses).
    """
    class Meta:
        model = Course
        fields = ["id", "code", "title", "credits"]
