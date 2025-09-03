from django.contrib.auth.models import User
from rest_framework import serializers
from core.models.teacher import Teacher


class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]


class TeacherSerializer(serializers.ModelSerializer):
    user = UserBriefSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        source="user", queryset=User.objects.all(), write_only=True
    )

    class Meta:
        model = Teacher
        fields = ["id", "user", "user_id", "department", "created_at"]
        read_only_fields = ["id", "created_at"]
