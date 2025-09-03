# core/views/export_views.py
from __future__ import annotations

import csv
from decimal import Decimal
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Prefetch
from rest_framework.views import APIView
from rest_framework import permissions
from rest_framework.exceptions import NotFound

from core.models import Course, Enrollment, Assessment, Grade
from core.permissions import IsInstructorOfCourse

# If you have an Attendance model and CourseSession model, import them.
# Adjust these imports to your actual module paths.
try:
    from core.models import Attendance, CourseSession
except Exception:
    Attendance = None
    CourseSession = None


def _d(x) -> Decimal:
    try:
        return Decimal(str(x or 0))
    except Exception:
        return Decimal("0")


class CourseGradesCSVView(APIView):
    """
    GET /courses/<course_id>/grades.csv
    Instructor/Admin-only. Streams a CSV gradebook for the course.
    """
    permission_classes = [permissions.IsAuthenticated, IsInstructorOfCourse]

    def get(self, request, course_id: int):
        course = Course.objects.filter(id=course_id).first()
        if not course:
            raise NotFound("Course not found.")

        # Build assessments and enrollments with grades
        assessments = list(
            Assessment.objects.filter(course_id=course_id).order_by("id")
        )
        enrollments = (
            Enrollment.objects.filter(course_id=course_id)
            .select_related("student", "course")
            .prefetch_related(
                Prefetch("grades", queryset=Grade.objects.select_related("assessment"))
            )
            .order_by("student__index_no", "id")
        )

        # Prepare response
        today = timezone.now().strftime("%Y%m%d")
        filename = f"gradebook_{getattr(course, 'code', 'course')}_{today}.csv"
        resp = HttpResponse(content_type="text/csv; charset=utf-8")
        resp["Content-Disposition"] = f'attachment; filename="{filename}"'
        writer = csv.writer(resp)

        # Header
        head = ["Student Index", "Student Name"]
        for a in assessments:
            head.append(f"{a.title} (/{a.max_marks})")
        head += ["Total %", "Weighted %"]
        writer.writerow(head)

        # Rows
        for enr in enrollments:
            student = getattr(enr, "student", None)
            index_no = getattr(student, "index_no", "") or ""
            full_name = getattr(student, "full_name", "") or getattr(student, "name", "") or ""

            # Map assessment_id -> grade
            grade_map = {g.assessment_id: g for g in getattr(enr, "grades", [])}

            total_score = Decimal("0")
            total_max = Decimal("0")
            weighted_sum = Decimal("0")

            row = [index_no, full_name]
            for a in assessments:
                g = grade_map.get(a.id)
                score = _d(getattr(g, "score", 0))
                max_marks = _d(getattr(a, "max_marks", 0))
                weight = _d(getattr(a, "weight", 0))

                row.append(f"{score.normalize() if score == score.to_integral() else score}/{max_marks}")

                total_score += score
                total_max += max_marks
                if max_marks:
                    weighted_sum += (score / max_marks) * weight

            overall_percent = Decimal("0")
            if total_max:
                overall_percent = (total_score / total_max) * Decimal("100")

            # Round to 2 decimals
            overall_percent = overall_percent.quantize(Decimal("0.01"))
            weighted_sum = weighted_sum.quantize(Decimal("0.01"))

            row += [f"{overall_percent}", f"{weighted_sum}"]
            writer.writerow(row)

        return resp


class CourseAttendanceCSVView(APIView):
    """
    GET /courses/<course_id>/attendance.csv
    Instructor/Admin-only. Streams a CSV of attendance records for the course.
    One row per attendance record (student × session).
    """
    permission_classes = [permissions.IsAuthenticated, IsInstructorOfCourse]

    def get(self, request, course_id: int):
        if Attendance is None or CourseSession is None:
            # If your project doesn't implement attendance, return a helpful CSV with a message.
            today = timezone.now().strftime("%Y%m%d")
            filename = f"attendance_{course_id}_{today}.csv"
            resp = HttpResponse(content_type="text/csv; charset=utf-8")
            resp["Content-Disposition"] = f'attachment; filename="{filename}"'
            writer = csv.writer(resp)
            writer.writerow(["info"])
            writer.writerow(["Attendance model not available in this project."])
            return resp

        course = Course.objects.filter(id=course_id).first()
        if not course:
            raise NotFound("Course not found.")

        # Gather attendance via session->course
        # Assumes Attendance(session -> CourseSession -> course, student, status, marked_at)
        sessions = CourseSession.objects.filter(course_id=course_id).only("id", "starts_at", "title", "week")
        session_ids = list(sessions.values_list("id", flat=True))

        # select_related to avoid N+1s
        qs = (
            Attendance.objects
            .filter(session_id__in=session_ids)
            .select_related("student", "session")
            .order_by("session__starts_at", "student__index_no")
        )

        today = timezone.now().strftime("%Y%m%d")
        filename = f"attendance_{getattr(course, 'code', 'course')}_{today}.csv"
        resp = HttpResponse(content_type="text/csv; charset=utf-8")
        resp["Content-Disposition"] = f'attachment; filename="{filename}"'
        writer = csv.writer(resp)

        # Header
        writer.writerow([
            "Session ID",
            "Session Title",
            "Session Start",
            "Student Index",
            "Student Name",
            "Status",
            "Marked At",
        ])

        # Rows
        for rec in qs:
            student = getattr(rec, "student", None)
            session = getattr(rec, "session", None)
            index_no = getattr(student, "index_no", "") or ""
            full_name = getattr(student, "full_name", "") or getattr(student, "name", "") or ""
            starts_at = getattr(session, "starts_at", None)
            session_title = getattr(session, "title", "") or f"Session {getattr(session, 'id', '')}"

            writer.writerow([
                getattr(session, "id", ""),
                session_title,
                starts_at.isoformat() if starts_at else "",
                index_no,
                full_name,
                getattr(rec, "status", ""),
                getattr(rec, "marked_at", "") or "",
            ])

        return resp
