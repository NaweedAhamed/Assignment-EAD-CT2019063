# core/serializers/gradebook_serializers.py
from __future__ import annotations
from decimal import Decimal, ROUND_HALF_UP
from typing import Iterable, Optional, Dict, Any

from django.db.models import Prefetch
from rest_framework import serializers

from core.models import Assessment, Enrollment, Grade


# -----------------
# Helper utilities
# -----------------

def d(val) -> Decimal:
    if isinstance(val, Decimal):
        return val
    try:
        return Decimal(str(val))
    except Exception:
        return Decimal("0")

def pct(numer: Decimal, denom: Decimal) -> Decimal:
    if denom and denom != 0:
        return (d(numer) / d(denom) * Decimal("100")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return Decimal("0.00")

def weighted_contribution(score: Decimal, max_marks: Decimal, weight: Decimal) -> Decimal:
    """
    (score / max_marks) * weight  → percentage points contributed to final.
    """
    if max_marks and max_marks != 0:
        return (d(score) / d(max_marks) * d(weight)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return Decimal("0.00")


# -----------------
# Brief serializers
# -----------------

class AssessmentBriefSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    type = serializers.CharField()
    weight = serializers.DecimalField(max_digits=6, decimal_places=2)
    max_marks = serializers.DecimalField(max_digits=6, decimal_places=2)
    due_date = serializers.DateTimeField(allow_null=True, required=False)

class GradeCellSerializer(serializers.Serializer):
    assessment_id = serializers.IntegerField()
    score = serializers.DecimalField(max_digits=6, decimal_places=2)
    max_marks = serializers.DecimalField(max_digits=6, decimal_places=2)
    percent = serializers.DecimalField(max_digits=6, decimal_places=2)
    weighted = serializers.DecimalField(max_digits=6, decimal_places=2)


# -----------------
# Course Gradebook (instructor view)
# -----------------

class GradebookRowSerializer(serializers.Serializer):
    # Student / enrollment
    enrollment_id = serializers.IntegerField()
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    index_no = serializers.CharField(allow_blank=True)
    # Per-assessment cells (aligned with `assessments`)
    grades = GradeCellSerializer(many=True)
    # Totals
    total_percent = serializers.DecimalField(max_digits=6, decimal_places=2)
    weighted_percent = serializers.DecimalField(max_digits=6, decimal_places=2)

class CourseGradebookSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    course_title = serializers.CharField()
    semester = serializers.CharField()
    assessments = AssessmentBriefSerializer(many=True)
    rows = GradebookRowSerializer(many=True)

    # -------- Builders you will call from the view --------
    @staticmethod
    def build_course_gradebook(
        course,
        assessments_qs: Optional[Iterable[Assessment]] = None,
        enrollments_qs: Optional[Iterable[Enrollment]] = None,
    ) -> Dict[str, Any]:
        """
        Returns a dict ready for CourseGradebookSerializer(data=...).is_valid(...); .data
        """
        # Fetch assessments and enrollments with grades if not provided
        if assessments_qs is None:
            assessments_qs = Assessment.objects.filter(course=course).order_by("id")

        if enrollments_qs is None:
            enrollments_qs = (
                Enrollment.objects
                .filter(course=course)
                .select_related("student", "course")
                .prefetch_related(
                    Prefetch("grades", queryset=Grade.objects.select_related("assessment"))
                )
                .order_by("student__index_no", "id")
            )

        # Normalize assessments list
        assessments = list(assessments_qs)
        assess_map = {a.id: a for a in assessments}

        # Build rows
        rows = []
        for enr in enrollments_qs:
            # map assessment_id -> grade
            grade_by_asmt = {}
            for g in getattr(enr, "grades", []):
                grade_by_asmt[getattr(g.assessment, "id", None)] = g

            grade_cells = []
            weighted_sum = Decimal("0.00")
            percent_sum = Decimal("0.00")  # unweighted overall percent (avg over 100 if desired; we’ll show simple sum of per-assessment % for transparency)
            # If you prefer a true overall % (sum(score)/sum(max_marks)*100), track accumulators:
            total_score = Decimal("0.00")
            total_max = Decimal("0.00")

            for a in assessments:
                g = grade_by_asmt.get(a.id)
                score = d(getattr(g, "score", 0))
                max_marks = d(getattr(a, "max_marks", 0))
                weight = d(getattr(a, "weight", 0))

                total_score += score
                total_max += max_marks

                percent_cell = pct(score, max_marks)
                weighted_cell = weighted_contribution(score, max_marks, weight)

                percent_sum += percent_cell
                weighted_sum += weighted_cell

                grade_cells.append({
                    "assessment_id": a.id,
                    "score": score.quantize(Decimal("0.00")),
                    "max_marks": max_marks.quantize(Decimal("0.00")),
                    "percent": percent_cell,
                    "weighted": weighted_cell,
                })

            overall_percent = pct(total_score, total_max)  # true overall %
            rows.append({
                "enrollment_id": enr.id,
                "student_id": enr.student_id,
                "student_name": getattr(enr.student, "full_name", "") or getattr(enr.student, "name", ""),
                "index_no": getattr(enr.student, "index_no", "") or "",
                "grades": grade_cells,
                "total_percent": overall_percent,          # overall % across assessments
                "weighted_percent": weighted_sum,          # sum of weighted contributions (0..100)
            })

        payload = {
            "course_id": course.id,
            "course_title": getattr(course, "title", ""),
            "semester": str(getattr(course, "semester", "")),
            "assessments": [
                {
                    "id": a.id,
                    "title": a.title,
                    "type": a.type,
                    "weight": d(a.weight).quantize(Decimal("0.00")),
                    "max_marks": d(a.max_marks).quantize(Decimal("0.00")),
                    "due_date": a.due_date,
                }
                for a in assessments
            ],
            "rows": rows,
        }
        return payload


# -----------------
# Student Results (student view)
# -----------------

class CourseResultItemSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    course_title = serializers.CharField()
    semester = serializers.CharField()
    assessments = AssessmentBriefSerializer(many=True)
    # Summary for this course
    total_percent = serializers.DecimalField(max_digits=6, decimal_places=2)
    weighted_percent = serializers.DecimalField(max_digits=6, decimal_places=2)

class StudentResultsSerializer(serializers.Serializer):
    """
    Represents either:
    - All-course results for the logged-in student, or
    - A single-course result (when `course` is passed to the builder).
    """
    items = CourseResultItemSerializer(many=True)

    @staticmethod
    def build_student_results(
        student_enrollments: Iterable[Enrollment],
        for_course_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Given a queryset/iterable of the student's enrollments (prefetched with grades & assessments),
        return a dict ready for StudentResultsSerializer(data=...).is_valid(...); .data
        """
        items = []

        # Expect prefetch to avoid N+1
        # - enrollment.course
        # - enrollment.grades (with assessment)
        # - we’ll fetch assessments per course (simple, cached in a dict)
        assessments_cache: Dict[int, list[Assessment]] = {}

        for enr in student_enrollments:
            course = enr.course
            if for_course_id and course.id != for_course_id:
                continue

            # Get course assessments (cached)
            if course.id not in assessments_cache:
                assessments_cache[course.id] = list(
                    Assessment.objects.filter(course=course).order_by("id")
                )
            assessments = assessments_cache[course.id]

            # Build totals
            total_score = Decimal("0.00")
            total_max = Decimal("0.00")
            weighted_sum = Decimal("0.00")

            # map assessment_id -> grade
            grade_by_asmt = {g.assessment_id: g for g in getattr(enr, "grades", [])}

            for a in assessments:
                g = grade_by_asmt.get(a.id)
                score = d(getattr(g, "score", 0))
                max_marks = d(getattr(a, "max_marks", 0))
                weight = d(getattr(a, "weight", 0))

                total_score += score
                total_max += max_marks
                weighted_sum += weighted_contribution(score, max_marks, weight)

            items.append({
                "course_id": course.id,
                "course_title": getattr(course, "title", ""),
                "semester": str(getattr(course, "semester", "")),
                "assessments": [
                    {
                        "id": a.id,
                        "title": a.title,
                        "type": a.type,
                        "weight": d(a.weight).quantize(Decimal("0.00")),
                        "max_marks": d(a.max_marks).quantize(Decimal("0.00")),
                        "due_date": a.due_date,
                    }
                    for a in assessments
                ],
                "total_percent": pct(total_score, total_max),
                "weighted_percent": weighted_sum,
            })

        return {"items": items}
