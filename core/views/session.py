from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from core.models import CourseSession
from core.serializers import CourseSessionSerializer


class DefaultPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 200


class CourseSessionViewSet(viewsets.ModelViewSet):
    queryset = CourseSession.objects.select_related("course").all()
    serializer_class = CourseSessionSerializer
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]

    search_fields = ["room", "notes", "course__title", "course__code"]
    filterset_fields = ["course", "semester", "date"]
    ordering_fields = ["date", "start_time", "id"]
    ordering = ["-date", "-start_time", "-id"]
