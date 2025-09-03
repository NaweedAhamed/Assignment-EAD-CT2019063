from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers
from core.models.user_profile import UserProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, default=UserProfile.ROLE_STUDENT)

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name", "role"]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already in use.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        role = validated_data.pop("role", UserProfile.ROLE_STUDENT)
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        UserProfile.objects.create(user=user, role=role)
        return user


class MeSerializer(serializers.Serializer):
    id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    role = serializers.CharField(source="profile.role", read_only=True)

    @staticmethod
    def from_user(user):
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": getattr(getattr(user, "profile", None), "role", None),
        }
