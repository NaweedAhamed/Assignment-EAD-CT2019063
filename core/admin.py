from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from core.models import (
    Course,
    Student,
    Enrollment,
    Assessment,
    Grade,
    CourseSession,
    Attendance,
    UserProfile,
)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role")
    list_filter = ("role",)
    search_fields = ("user__username", "user__email", "user__first_name", "user__last_name")

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
    # removed 'semester' because Enrollment has no such field
    list_display = ("student", "course", "status", "enrolled_at")
    search_fields = (
        "student__index_no",
        "student__full_name",
        "course__code",
        "course__title",
    )
    list_filter = ("status", "course")
    ordering = ("-enrolled_at",)

@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ("id", "course", "semester", "title", "type", "weight", "max_marks", "due_date")
    list_filter = ("type", "semester", "course")
    search_fields = ("title", "course__title", "course__code")

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

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ("id", "enrollment", "assessment", "score", "graded_at", "grader")
    # removed SemesterFilter (Enrollment has no semester)
    list_filter = ("assessment", "enrollment", CourseFilter)
    search_fields = (
        "assessment__title",
        "enrollment__student__full_name",
        "enrollment__student__index_no",
        "enrollment__course__title",
        "enrollment__course__code",
    )
    ordering = ("-graded_at",)

@admin.register(CourseSession)
class CourseSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "course", "semester", "date", "start_time", "end_time", "room")
    list_filter = ("course", "semester", "date")
    search_fields = ("room", "notes", "course__title", "course__code")
    ordering = ("-date", "-start_time")

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "enrollment", "status", "marked_at", "marker")
    list_filter = ("status", "session", "enrollment")
    search_fields = (
        "enrollment__student__full_name",
        "enrollment__student__index_no",
        "enrollment__course__title",
        "enrollment__course__code",
    )
    ordering = ("-marked_at",)
