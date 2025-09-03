from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, filters, status, permissions, response
from rest_framework.exceptions import PermissionDenied

from core.models import Enrollment, Student, Course
from core.serializers import EnrollmentSerializer
from core.permissions import has_role


def _student_for_user(user):
    """
    Resolve the Student row for the authenticated user.
    Prefers Student.user O2O if present; otherwise falls back to email match.
    """
    if not (user and user.is_authenticated):
        return None

    # If your Student model has user = OneToOneField(User)
    if hasattr(Student, "user"):
        try:
            return Student.objects.get(user=user)
        except Student.DoesNotExist:
            pass

    if getattr(user, "email", None):
        return Student.objects.filter(email=user.email).first()
    return None


class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    Public: list/retrieve enrollments.
    Authenticated:
      - Students can CREATE their own enrollment (self-enroll) and DELETE their own enrollment (drop).
      - Admin/Teacher can manage any enrollment (create/update/delete).
    Supports basic search & ordering. Filtering via query params:
      - ?student=<id>
      - ?course=<id>
      - ?status=enrolled|active|dropped
    """
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["student__index_no", "student__full_name", "course__code", "course__title"]
    ordering_fields = ["enrolled_at", "status", "student__index_no", "course__code"]
    ordering = ["-enrolled_at"]

    def get_queryset(self):
        qs = Enrollment.objects.select_related("student", "course").all()

        student_id = self.request.query_params.get("student")
        course_id = self.request.query_params.get("course")
        status_param = self.request.query_params.get("status")

        if student_id:
            qs = qs.filter(student_id=student_id)
        if course_id:
            qs = qs.filter(course_id=course_id)
        if status_param:
            # accept both "active" and "enrolled" as the same
            normalized = status_param.lower()
            if normalized == "active":
                normalized = "enrolled"
            if normalized in {"enrolled", "dropped"}:
                qs = qs.filter(status=normalized)

        return qs

    # ---- create (self-enroll) ----
    def create(self, request, *args, **kwargs):
        """
        Students: POST { course: <id> } (or course_id)
        Admin/Teacher: may also specify student.
        """
        user = request.user
        is_manager = has_role(user, "admin", "teacher")
        data = request.data.copy()

        # Normalize course field
        course_id = data.get("course") or data.get("course_id")
        if course_id and not data.get("course"):
            data["course"] = course_id
        if not data.get("course"):
            return response.Response({"detail": "course is required"}, status=status.HTTP_400_BAD_REQUEST)

        # If not admin/teacher, force the student to the caller's Student
        if not is_manager:
            student = _student_for_user(user)
            if not student:
                raise PermissionDenied("No student profile linked to this account.")
            data["student"] = student.id  # override any incoming student

        ser = self.get_serializer(data=data)
        ser.is_valid(raise_exception=True)

        try:
            self.perform_create(ser)
        except IntegrityError:
            # likely unique constraint (student, course)
            return response.Response({"detail": "Already enrolled for this course."}, status=status.HTTP_400_BAD_REQUEST)

        headers = self.get_success_headers(ser.data)
        return response.Response(ser.data, status=status.HTTP_201_CREATED, headers=headers)

    # ---- update / partial_update (managers only) ----
    def update(self, request, *args, **kwargs):
        user = request.user
        if not has_role(user, "admin", "teacher"):
            raise PermissionDenied("Only admins/teachers can update enrollments.")
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        user = request.user
        if not has_role(user, "admin", "teacher"):
            raise PermissionDenied("Only admins/teachers can update enrollments.")
        return super().partial_update(request, *args, **kwargs)

    # ---- destroy (drop) ----
    def destroy(self, request, *args, **kwargs):
        """
        Students can drop their own enrollment.
        Admin/Teacher can delete any.
        """
        user = request.user
        is_manager = has_role(user, "admin", "teacher")

        instance = self.get_object()

        if not is_manager:
            student = _student_for_user(user)
            if not student or instance.student_id != student.id:
                raise PermissionDenied("You can only drop your own enrollments.")

        self.perform_destroy(instance)
        return response.Response(status=status.HTTP_204_NO_CONTENT)
