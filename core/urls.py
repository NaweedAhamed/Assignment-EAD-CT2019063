from django.urls import path, include
from rest_framework.routers import DefaultRouter

from core.views import (
    StudentViewSet,
    CourseViewSet,
    EnrollmentViewSet,
    AssessmentViewSet,
    GradeViewSet,
    CourseSessionViewSet,
    AttendanceViewSet,
)
from core.views.teacher import TeacherViewSet
from core.views.profile import StudentsMeView

router = DefaultRouter()
router.register(r"students", StudentViewSet, basename="student")
router.register(r"teachers", TeacherViewSet, basename="teacher")
router.register(r"courses", CourseViewSet, basename="course")
router.register(r"enrollments", EnrollmentViewSet, basename="enrollment")
router.register(r"assessments", AssessmentViewSet, basename="assessment")
router.register(r"grades", GradeViewSet, basename="grade")
router.register(r"sessions", CourseSessionViewSet, basename="session")
router.register(r"attendance", AttendanceViewSet, basename="attendance")

urlpatterns = [
    path("", include(router.urls)),
    path("students/me/", StudentsMeView.as_view(), name="students-me"),
]
