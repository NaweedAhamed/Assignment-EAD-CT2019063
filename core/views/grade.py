from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from core.models import Grade
from core.serializers import GradeSerializer


class DefaultPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 200


class GradeViewSet(viewsets.ModelViewSet):
    queryset = (
        Grade.objects
        .select_related(
            "assessment",
            "enrollment",
            "enrollment__student",
            "enrollment__course",
        )
        .all()
    )
    serializer_class = GradeSerializer
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]

    # Search by student name/index or assessment title
    search_fields = [
        "enrollment__student__full_name",
        "enrollment__student__index_no",
        "assessment__title",
        "enrollment__course__title",
        "enrollment__course__code",
    ]
    # Filter by course, semester, assessment, student, enrollment
    filterset_fields = {
        "assessment": ["exact"],
        "enrollment": ["exact"],
        "enrollment__student": ["exact"],
        "enrollment__course": ["exact"],
        "enrollment__semester": ["exact"],
    }
    ordering_fields = ["id", "graded_at", "score"]
    ordering = ["-graded_at", "id"]
