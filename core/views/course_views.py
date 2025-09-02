from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from core.models import Course
from core.serializers import CourseSerializer
from .permissions import IsAdminOrReadOnly


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAdminOrReadOnly]

    # simple search & ordering (nice-to-have)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["code", "title"]
    ordering_fields = ["code", "title", "credits", "created_at"]
    ordering = ["code"]
