// src/components/courses/CourseCard.jsx
import React from "react";

/**
 * CourseCard
 * Displays basic information about a course.
 * Accepts either a plain course object or an enrollment object with a nested course.
 */
export default function CourseCard({ course }) {
  // If coming from MyCourses (enrollment), the actual course is nested
  const c = course?.course || course;

  if (!c) return null;

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white">
      <h2 className="text-lg font-semibold text-gray-800">
        {c.code} — {c.title}
      </h2>
      <p className="text-sm text-gray-600">
        Credits: {c.credits ?? "-"} | Semester: {c.semester ?? "-"}
      </p>
    </div>
  );
}
