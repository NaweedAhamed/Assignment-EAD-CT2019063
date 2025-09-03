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

router = DefaultRouter()
router.register(r"students", StudentViewSet, basename="student")
router.register(r"courses", CourseViewSet, basename="course")
router.register(r"enrollments", EnrollmentViewSet, basename="enrollment")
router.register(r"assessments", AssessmentViewSet, basename="assessment")
router.register(r"grades", GradeViewSet, basename="grade")
router.register(r"sessions", CourseSessionViewSet, basename="session")
router.register(r"attendance", AttendanceViewSet, basename="attendance")

urlpatterns = [
    path("", include(router.urls)),
]
