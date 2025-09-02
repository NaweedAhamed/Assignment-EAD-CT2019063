from django.contrib import admin
from core.models import Course
from core.models import Course, Student


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
