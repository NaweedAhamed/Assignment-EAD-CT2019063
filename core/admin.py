from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from core.models import Course, Student, Enrollment, Assessment, Grade, CourseSession, Attendance


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("code", "title", "credits", "created_at")
    search_fields = ("code", "title")
    list_filter = ("credits",)
    ordering = ("code",)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("index_no", "full_name", "email", "program", "created_at")
    search_fields = ("index_no", "full_name", "email", "program")
    ordering = ("index_no",)


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "status", "enrolled_at")
    search_fields = (
        "student__index_no",
        "student__full_name",
        "course__code",
        "course__title",
    )
    # ❗ use direct fields in list_filter (no double-underscore)
    list_filter = ("status", "course")
    ordering = ("-enrolled_at",)


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ("id", "course", "semester", "title", "type", "weight", "max_marks", "due_date")
    list_filter = ("type", "semester", "course")
    search_fields = ("title", "course__title", "course__code")


# ----- Optional niceties for Grade admin: course & semester filters -----
class CourseFilter(SimpleListFilter):
    title = "course"
    parameter_name = "course"

    def lookups(self, request, model_admin):
        return [(c.id, c.title) for c in Course.objects.all().order_by("title")]

    def queryset(self, request, queryset):
        val = self.value()
        if val:
            return queryset.filter(enrollment__course_id=val)
        return queryset


class SemesterFilter(SimpleListFilter):
    title = "semester"
    parameter_name = "semester"

    def lookups(self, request, model_admin):
        return [(str(i), f"Semester {i}") for i in range(1, 9)]

    def queryset(self, request, queryset):
        val = self.value()
        if val:
            return queryset.filter(enrollment__semester=str(val))
        return queryset
# -----------------------------------------------------------------------


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ("id", "enrollment", "assessment", "score", "graded_at", "grader")
    # ❗ direct FKs only + custom filters (no double-underscore in list_filter)
    list_filter = ("assessment", "enrollment", CourseFilter, SemesterFilter)
    search_fields = (
        "assessment__title",
        "enrollment__student__full_name",
        "enrollment__student__index_no",
        "enrollment__course__title",
        "enrollment__course__code",
    )


@admin.register(CourseSession)
class CourseSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "course", "semester", "date", "start_time", "end_time", "room")
    list_filter = ("course", "semester", "date")
    search_fields = ("room", "notes", "course__title", "course__code")
    ordering = ("-date", "-start_time")


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "enrollment", "status", "marked_at", "marker")
    # Use direct FKs in list_filter to avoid admin.E116
    list_filter = ("status", "session", "enrollment")
    search_fields = (
        "enrollment__student__full_name",
        "enrollment__student__index_no",
        "enrollment__course__title",
        "enrollment__course__code",
    )
    ordering = ("-marked_at",)
