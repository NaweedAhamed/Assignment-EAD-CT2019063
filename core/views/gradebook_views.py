# core/views/gradebook_views.py
from __future__ import annotations

from django.db.models import Prefetch
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, NotFound

from core.models import Course, Enrollment, Grade, Assessment, Student
from core.permissions import IsInstructorOfCourse, IsStudent, has_role
from core.serializers.gradebook_serializers import (
    CourseGradebookSerializer,
    StudentResultsSerializer,
)


def _student_for_user(user) -> Student | None:
    """
    Resolve the Student row for the authenticated user.
    Prefers Student.user O2O if present; otherwise falls back to email match.
    """
    if not (user and user.is_authenticated):
        return None

    # If your Student model has user = OneToOneField(User)
    if hasattr(Student, "user"):
        try:
            return Student.objects.get(user=user)
        except Student.DoesNotExist:
            pass

    if getattr(user, "email", None):
        return Student.objects.filter(email=user.email).first()
    return None


class CourseGradebookView(APIView):
    """
    Instructor/Admin: full gradebook for a course.
    GET /core/courses/<course_id>/gradebook/
    """
    permission_classes = [permissions.IsAuthenticated, IsInstructorOfCourse]

    def get(self, request, course_id: int):
        course = Course.objects.filter(id=course_id).first()
        if not course:
            raise NotFound("Course not found.")

        # Build payload (assessments + enrollments with grades)
        enrollments_qs = (
            Enrollment.objects.filter(course=course)
            .select_related("student", "course")
            .prefetch_related(
                Prefetch("grades", queryset=Grade.objects.select_related("assessment"))
            )
            .order_by("student__index_no", "id")
        )
        assessments_qs = Assessment.objects.filter(course=course).order_by("id")

        payload = CourseGradebookSerializer.build_course_gradebook(
            course=course,
            assessments_qs=assessments_qs,
            enrollments_qs=enrollments_qs,
        )
        ser = CourseGradebookSerializer(data=payload)
        ser.is_valid(raise_exception=True)
        return Response(ser.data)


class MyResultsView(APIView):
    """
    Student: results across all my courses.
    GET /core/my-results/
    """
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request):
        student = _student_for_user(request.user)
        if not student:
            # Allow admin to inspect by acting as student if needed
            if has_role(request.user, "admin"):
                return Response({"items": []})
            raise PermissionDenied("No student profile linked to this account.")

        enrollments_qs = (
            Enrollment.objects.filter(student=student)
            .select_related("course")
            .prefetch_related(
                Prefetch("grades", queryset=Grade.objects.select_related("assessment"))
            )
            .order_by("course__id")
        )

        payload = StudentResultsSerializer.build_student_results(enrollments_qs)
        ser = StudentResultsSerializer(data=payload)
        ser.is_valid(raise_exception=True)
        return Response(ser.data)


class MyCourseResultView(APIView):
    """
    Student: results for a single course I’m enrolled in.
    GET /core/courses/<course_id>/my-results/
    """
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request, course_id: int):
        student = _student_for_user(request.user)
        if not student:
            raise PermissionDenied("No student profile linked to this account.")

        # Ensure the student is enrolled in the course
        enrollments_qs = (
            Enrollment.objects.filter(student=student, course_id=course_id)
            .select_related("course")
            .prefetch_related(
                Prefetch("grades", queryset=Grade.objects.select_related("assessment"))
            )
        )
        if not enrollments_qs.exists():
            raise NotFound("You are not enrolled in this course or it does not exist.")

        payload = StudentResultsSerializer.build_student_results(
            student_enrollments=enrollments_qs,
            for_course_id=course_id,
        )
        ser = StudentResultsSerializer(data=payload)
        ser.is_valid(raise_exception=True)
        return Response(ser.data)
