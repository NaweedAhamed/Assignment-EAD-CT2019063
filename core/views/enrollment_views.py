from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from core.models import Enrollment
from core.serializers import EnrollmentSerializer
from .permissions import IsAdminOrReadOnly


class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    Public: list/retrieve enrollments.
    Admin/staff: create/update/delete.
    Supports basic search & ordering. Simple filtering via query params:
      - ?student=<id>
      - ?course=<id>
      - ?status=active|dropped
    """
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["student__index_no", "student__full_name", "course__code", "course__title"]
    ordering_fields = ["enrolled_at", "status", "student__index_no", "course__code"]
    ordering = ["-enrolled_at"]

    def get_queryset(self):
        qs = (
            Enrollment.objects
            .select_related("student", "course")
            .all()
        )
        student_id = self.request.query_params.get("student")
        course_id = self.request.query_params.get("course")
        status = self.request.query_params.get("status")

        if student_id:
            qs = qs.filter(student_id=student_id)
        if course_id:
            qs = qs.filter(course_id=course_id)
        if status in {"active", "dropped"}:
            qs = qs.filter(status=status)

        return qs
