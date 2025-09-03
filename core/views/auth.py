from django.contrib.auth.models import User
from rest_framework import generics, permissions, response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from core.serializers.auth import RegisterSerializer, MeSerializer


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user: User):
        token = super().get_token(user)
        profile = getattr(user, "profile", None)
        token["role"] = getattr(profile, "role", None)
        token["username"] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        profile = getattr(user, "profile", None)
        data["user"] = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": getattr(profile, "role", None),
        }
        return data


class LoginView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return response.Response(MeSerializer.from_user(request.user))
