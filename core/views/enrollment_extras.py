from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from core.models import Enrollment, Student, Course
from core.serializers import EnrollmentSerializer


def _student_for_user(user):
    """
    Resolve the Student row for the authenticated user.
    Prefers Student.user O2O if present; otherwise falls back to email match.
    """
    # If your Student model has user = OneToOneField(User)
    if hasattr(Student, "user"):
        try:
            return Student.objects.get(user=user)
        except Student.DoesNotExist:
            pass

    if getattr(user, "email", None):
        return Student.objects.filter(email=user.email).first()
    return None


class EnrollmentsMeView(generics.ListAPIView):
    """
    GET /api/enrollments/me/  -> list of the logged-in student's enrollments
    Optional query params: ?status=enrolled|dropped, ?ordering=...
    """
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        student = _student_for_user(self.request.user)
        if not student:
            # Return empty queryset if no Student linked
            return Enrollment.objects.none()
        qs = (
            Enrollment.objects
            .select_related("student", "course")
            .filter(student=student)
        )
        status_param = self.request.query_params.get("status")
        if status_param:
            qs = qs.filter(status=status_param)
        ordering = self.request.query_params.get("ordering")
        if ordering:
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by("-enrolled_at")
        return qs


class CourseRosterView(generics.ListAPIView):
    """
    GET /api/courses/<course_id>/enrollments/  -> roster (admin/teacher only)
    Optional query params: ?status=enrolled (default)
    """
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = getattr(getattr(user, "profile", None), "role", None)
        if not (user.is_superuser or user.is_staff or role in {"admin", "teacher"}):
            raise PermissionDenied("Only admins/teachers can view rosters.")

        course_id = self.kwargs.get("course_id")
        # 404 if course doesn't exist
        get_object_or_404(Course, pk=course_id)
        qs = (
            Enrollment.objects
            .select_related("student", "course")
            .filter(course_id=course_id)
        )
        status_param = self.request.query_params.get("status", "enrolled")
        if status_param:
            qs = qs.filter(status=status_param)
        ordering = self.request.query_params.get("ordering")
        if ordering:
            qs = qs.order_by(ordering)
        else:
            qs = qs.order_by("student__full_name", "student__index_no")
        return qs
