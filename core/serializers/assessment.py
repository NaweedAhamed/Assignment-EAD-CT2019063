from decimal import Decimal
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from core.models import Assessment


class AssessmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = Assessment
        fields = [
            "id",
            "course",
            "course_title",
            "semester",
            "title",
            "type",
            "weight",
            "max_marks",
            "due_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]
        validators = [
            UniqueTogetherValidator(
                queryset=Assessment.objects.all(),
                fields=("course", "semester", "title"),
                message="Title must be unique per course and semester.",
            )
        ]

    def validate_weight(self, value):
        if value is None or value <= 0 or value > 100:
            raise serializers.ValidationError("Weight must be > 0 and ≤ 100.")
        return value

    def validate_max_marks(self, value):
        if value is None or value <= 0:
            raise serializers.ValidationError("Max marks must be > 0.")
        return value

    def validate(self, attrs):
        """
        OPTIONAL: enforce cumulative weight ≤ 100 for (course, semester).
        Comment this block out if you don't want that constraint.
        """
        course = attrs.get("course", getattr(self.instance, "course", None))
        semester = attrs.get("semester", getattr(self.instance, "semester", None))
        weight = attrs.get("weight", getattr(self.instance, "weight", Decimal("0")))
        if course and semester and weight:
            qs = Assessment.objects.filter(course=course, semester=semester)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            current_total = qs.aggregate(total=serializers.models.Sum("weight"))["total"] or Decimal("0")
            if current_total + weight > Decimal("100"):
                raise serializers.ValidationError(
                    {"weight": f"Total weight would exceed 100 (currently {current_total})."}
                )
        return attrs
