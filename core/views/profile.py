from rest_framework import permissions, response, status
from rest_framework.views import APIView
from core.models import Student
from core.serializers import StudentSerializer


class StudentsMeView(APIView):
    """
    GET/PUT the authenticated student's profile.

    Works if Student has a OneToOneField to User named 'user'.
    If not, it falls back to matching by email == request.user.email.
    """
    permission_classes = [permissions.IsAuthenticated]

    def _get_student_for_user(self, user):
        # Prefer explicit relation if the model has it
        if hasattr(Student, "user"):
            try:
                return Student.objects.get(user=user)
            except Student.DoesNotExist:
                pass
        # Fallback: match by user email (best-effort)
        if getattr(user, "email", None):
            return Student.objects.filter(email=user.email).first()
        return None

    def get(self, request):
        stu = self._get_student_for_user(request.user)
        if not stu:
            return response.Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        ser = StudentSerializer(stu)
        return response.Response(ser.data)

    def put(self, request):
        stu = self._get_student_for_user(request.user)
        if not stu:
            return response.Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        ser = StudentSerializer(stu, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return response.Response(ser.data)
