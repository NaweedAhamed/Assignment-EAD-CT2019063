from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from core.models import Attendance
from core.serializers import AttendanceSerializer


class DefaultPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = "page_size"
    max_page_size = 500


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = (
        Attendance.objects
        .select_related(
            "session",
            "enrollment",
            "enrollment__student",
            "enrollment__course",
        )
        .all()
    )
    serializer_class = AttendanceSerializer
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]

    # Search by student name/index, course title/code, or room/notes via session
    search_fields = [
        "enrollment__student__full_name",
        "enrollment__student__index_no",
        "enrollment__course__title",
        "enrollment__course__code",
    ]

    # Filter support
    filterset_fields = {
        "session": ["exact"],
        "enrollment": ["exact"],
        "status": ["exact"],
        "enrollment__student": ["exact"],
        "enrollment__course": ["exact"],
        "enrollment__semester": ["exact"],
    }

    ordering_fields = ["marked_at", "id", "status"]
    ordering = ["-marked_at", "-id"]
