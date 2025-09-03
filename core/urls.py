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
from core.views.enrollment_views import MyCoursesView, CourseRosterView
from core.views.gradebook_views import CourseGradebookView, MyResultsView, MyCourseResultView
from core.views.dashboard_views import StudentDashboardView, AdminDashboardView
from core.views.export_views import CourseGradesCSVView, CourseAttendanceCSVView  # ✅ new imports

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

    # ✅ Part 6 endpoints
    path("my-courses/", MyCoursesView.as_view(), name="my-courses"),
    path("courses/<int:course_id>/roster/", CourseRosterView.as_view(), name="course-roster"),

    # ✅ Part 7 endpoints
    path("courses/<int:course_id>/gradebook/", CourseGradebookView.as_view(), name="course-gradebook"),
    path("my-results/", MyResultsView.as_view(), name="my-results"),
    path("courses/<int:course_id>/my-results/", MyCourseResultView.as_view(), name="my-course-result"),

    # ✅ Part 8 endpoints (Dashboards)
    path("dashboard/student/", StudentDashboardView.as_view(), name="dashboard-student"),
    path("dashboard/admin/", AdminDashboardView.as_view(), name="dashboard-admin"),

    # ✅ Part 9 endpoints (CSV Exports)
    path("courses/<int:course_id>/grades.csv", CourseGradesCSVView.as_view(), name="course-grades-csv"),
    path("courses/<int:course_id>/attendance.csv", CourseAttendanceCSVView.as_view(), name="course-attendance-csv"),
]
