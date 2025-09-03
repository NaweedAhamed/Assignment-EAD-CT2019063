from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from core.models import Assessment
from core.serializers import AssessmentSerializer


class DefaultPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 200


class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.select_related("course").all()
    serializer_class = AssessmentSerializer
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]

    search_fields = ["title", "course__title", "course__code"]
    filterset_fields = ["course", "semester", "type"]
    ordering_fields = ["due_date", "id", "title"]
    ordering = ["due_date", "id"]
