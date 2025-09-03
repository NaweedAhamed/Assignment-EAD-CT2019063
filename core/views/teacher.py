from rest_framework import viewsets, permissions, filters
from core.models.teacher import Teacher
from core.serializers.teacher import TeacherSerializer
from .permissions import IsAdmin


class TeacherViewSet(viewsets.ModelViewSet):
    """
    Admin-only CRUD for teachers.
    """
    queryset = Teacher.objects.select_related("user").all()
    serializer_class = TeacherSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["user__username", "user__first_name", "user__last_name", "department"]
    ordering = ["user__username"]

    def get_permissions(self):
        # Only admins can list/create/update/delete teachers
        if self.action in {"list", "retrieve", "create", "update", "partial_update", "destroy"}:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]
