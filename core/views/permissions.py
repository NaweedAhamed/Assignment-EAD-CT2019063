from rest_framework.permissions import BasePermission, SAFE_METHODS


def has_role(user, *roles):
    """
    Returns True if the authenticated user has one of the given roles
    (via User.profile.role) or is Django staff/superuser.
    """
    if not (user and user.is_authenticated):
        return False
    if user.is_superuser or user.is_staff:
        return True
    role = getattr(getattr(user, "profile", None), "role", None)
    return role in roles


class IsAdmin(BasePermission):
    """Allow only admins (or Django staff/superuser)."""
    def has_permission(self, request, view):
        return has_role(request.user, "admin")


class IsTeacher(BasePermission):
    """Allow only teachers (or Django staff/superuser)."""
    def has_permission(self, request, view):
        return has_role(request.user, "teacher")


class IsStudent(BasePermission):
    """Allow only students (or Django staff/superuser)."""
    def has_permission(self, request, view):
        return has_role(request.user, "student")


class IsAdminOrReadOnly(BasePermission):
    """
    Read-only for everyone; write actions only for admins (or Django staff/superuser).
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return has_role(request.user, "admin")
