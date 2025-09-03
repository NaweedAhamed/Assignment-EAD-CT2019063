# core/serializers/dashboard_serializers.py
from __future__ import annotations
from rest_framework import serializers


# ---------- Student Dashboard ----------

class StudentDashboardCourseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    code = serializers.CharField()
    title = serializers.CharField()
    credits = serializers.IntegerField(required=False)

class StudentDashboardUpcomingSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    course_id = serializers.IntegerField()
    course_title = serializers.CharField()
    title = serializers.CharField()
    type = serializers.CharField()
    due_date = serializers.DateTimeField()

class StudentDashboardRecentGradeSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    course_id = serializers.IntegerField()
    course_title = serializers.CharField()
    assessment_title = serializers.CharField()
    score = serializers.DecimalField(max_digits=6, decimal_places=2)
    max_marks = serializers.DecimalField(max_digits=6, decimal_places=2)
    graded_at = serializers.DateTimeField()

class StudentDashboardSerializer(serializers.Serializer):
    courses = StudentDashboardCourseSerializer(many=True)
    upcoming_assessments = StudentDashboardUpcomingSerializer(many=True)
    recent_grades = StudentDashboardRecentGradeSerializer(many=True)
    alerts = serializers.ListField(child=serializers.CharField(), default=[])


# ---------- Admin Dashboard ----------

class StatCardSerializer(serializers.Serializer):
    label = serializers.CharField()
    value = serializers.IntegerField()

class TopCourseSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    code = serializers.CharField()
    title = serializers.CharField()
    enrollments = serializers.IntegerField()

class AdminActivityItemSerializer(serializers.Serializer):
    kind = serializers.CharField()  # "enrollment" | "grade" | "assessment"
    id = serializers.IntegerField()
    when = serializers.DateTimeField()
    summary = serializers.CharField()

class AdminDashboardSerializer(serializers.Serializer):
    stats = StatCardSerializer(many=True)
    top_courses = TopCourseSerializer(many=True)
    recent_activity = AdminActivityItemSerializer(many=True)
