from rest_framework import serializers
from core.models import Student


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            "id",
            "index_no",
            "full_name",
            "email",
            "program",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_index_no(self, value):
        if not value.strip():
            raise serializers.ValidationError("Index number cannot be empty.")
        return value

    def validate_full_name(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Full name is too short.")
        return value
