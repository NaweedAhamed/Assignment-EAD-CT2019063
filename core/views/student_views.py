from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from core.models import Student
from core.serializers import StudentSerializer
from .permissions import IsAdminOrReadOnly


class StudentViewSet(viewsets.ModelViewSet):
    """
    Public: can list/retrieve students.
    Admin/staff: can create/update/delete.
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAdminOrReadOnly]

    # basic search & ordering
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["index_no", "full_name", "email", "program"]
    ordering_fields = ["index_no", "full_name", "created_at"]
    ordering = ["index_no"]
