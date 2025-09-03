# core/views/dashboard_views.py
from __future__ import annotations

from datetime import datetime, timezone
from django.db.models import Count, Prefetch
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions

from core.models import (
    Student, Teacher, Course, Enrollment, Assessment, Grade
)
from core.permissions import IsAdmin, IsStudent, has_role
from core.serializers.dashboard_serializers import (
    StudentDashboardSerializer,
    AdminDashboardSerializer,
)


def _student_for_user(user):
    if not (user and user.is_authenticated):
        return None
    if hasattr(Student, "user"):
        try:
            return Student.objects.get(user=user)
        except Student.DoesNotExist:
            pass
    if getattr(user, "email", None):
        return Student.objects.filter(email=user.email).first()
    return None


class StudentDashboardView(APIView):
    """
    GET /dashboard/student/
    """
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request):
        student = _student_for_user(request.user)
        if not student:
            # admins browsing as no-student users get empty data
            if has_role(request.user, "admin"):
                return Response({"courses": [], "upcoming_assessments": [], "recent_grades": [], "alerts": []})
            return Response({"detail": "No student profile linked to this account."}, status=403)

        # My active courses (via enrollments)
        enrollments = (
            Enrollment.objects
            .filter(student=student)
            .select_related("course")
            .order_by("course__code")
        )
        courses = [
            {
                "id": e.course.id,
                "code": e.course.code,
                "title": e.course.title,
                "credits": getattr(e.course, "credits", 0) or 0,
            }
            for e in enrollments
        ]

        # Upcoming assessments (due_date in the future) for my courses
        course_ids = [e.course_id for e in enrollments]
        now = datetime.now(timezone.utc)
        upcoming = (
            Assessment.objects
            .filter(course_id__in=course_ids, due_date__isnull=False, due_date__gte=now)
            .select_related("course")
            .order_by("due_date")[:8]
        )
        upcoming_assessments = [
            {
                "id": a.id,
                "course_id": a.course_id,
                "course_title": a.course.title,
                "title": a.title,
                "type": a.type,
                "due_date": a.due_date,
            }
            for a in upcoming
        ]

        # Recent grades (last 8)
        recent_grades_qs = (
            Grade.objects
            .filter(enrollment__student=student)
            .select_related("enrollment__course", "assessment")
            .order_by("-graded_at")[:8]
        )
        recent_grades = [
            {
                "id": g.id,
                "course_id": g.enrollment.course_id,
                "course_title": g.enrollment.course.title,
                "assessment_title": g.assessment.title,
                "score": g.score,
                "max_marks": g.assessment.max_marks,
                "graded_at": g.graded_at,
            }
            for g in recent_grades_qs
        ]

        # Simple alerts (examples)
        alerts = []
        if not courses:
            alerts.append("You are not enrolled in any courses.")
        if not upcoming_assessments and courses:
            alerts.append("No upcoming assessments scheduled.")

        data = {
            "courses": courses,
            "upcoming_assessments": upcoming_assessments,
            "recent_grades": recent_grades,
            "alerts": alerts,
        }
        return Response(StudentDashboardSerializer(data).data)


class AdminDashboardView(APIView):
    """
    GET /dashboard/admin/
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        # Stats
        stats = [
            {"label": "Students", "value": Student.objects.count()},
            {"label": "Teachers", "value": Teacher.objects.count() if "Teacher" in [m.__name__ for m in Teacher.__mro__] else Teacher.objects.count()},
            {"label": "Courses", "value": Course.objects.count()},
            {"label": "Enrollments", "value": Enrollment.objects.count()},
        ]

        # Top courses by enrollment
        top_courses_qs = (
            Course.objects
            .annotate(enrollments_count=Count("enrollment"))
            .order_by("-enrollments_count", "code")[:8]
        )
        top_courses = [
            {
                "course_id": c.id,
                "code": c.code,
                "title": c.title,
                "enrollments": c.enrollments_count or 0,
            }
            for c in top_courses_qs
        ]

        # Recent activity (simple blend of last 10 enrollments/grades/assessments)
        recent_enr = (
            Enrollment.objects.select_related("student", "course")
            .order_by("-enrolled_at")[:4]
        )
        recent_grades = (
            Grade.objects.select_related("enrollment__student", "enrollment__course", "assessment")
            .order_by("-graded_at")[:4]
        )
        recent_asmts = (
            Assessment.objects.select_related("course")
            .order_by("-created_at")[:4]
        )

        activity = []
        for e in recent_enr:
            activity.append({
                "kind": "enrollment",
                "id": e.id,
                "when": getattr(e, "enrolled_at", None) or getattr(e, "updated_at", None),
                "summary": f"Enrollment: {getattr(e.student, 'full_name', 'Student')} → {e.course.code}",
            })
        for g in recent_grades:
            activity.append({
                "kind": "grade",
                "id": g.id,
                "when": g.graded_at,
                "summary": f"Grade: {g.enrollment.course.code} · {g.assessment.title} = {g.score}",
            })
        for a in recent_asmts:
            activity.append({
                "kind": "assessment",
                "id": a.id,
                "when": getattr(a, "created_at", None),
                "summary": f"Assessment created: {a.course.code} · {a.title}",
            })

        # sort combined activity by time desc, keep 10
        activity = sorted(activity, key=lambda x: (x["when"] or datetime.min.replace(tzinfo=timezone.utc)), reverse=True)[:10]

        data = {
            "stats": stats,
            "top_courses": top_courses,
            "recent_activity": activity,
        }
        return Response(AdminDashboardSerializer(data).data)
