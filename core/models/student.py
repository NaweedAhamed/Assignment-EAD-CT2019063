from django.db import models


class Student(models.Model):
    index_no = models.CharField(max_length=50, unique=True)   # e.g., CT2019063
    full_name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    program = models.CharField(max_length=120, blank=True)    # e.g., "BSc in IT"
    # housekeeping
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["index_no"]
        verbose_name = "Student"
        verbose_name_plural = "Students"

    def __str__(self) -> str:
        return f"{self.index_no} — {self.full_name}"
