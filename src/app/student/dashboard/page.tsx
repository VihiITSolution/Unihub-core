"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import enrollmentService, { Enrollment } from "@/services/enrollment.service";
import { BACKEND_URL } from "@/lib/constants";

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalLearningTime, setTotalLearningTime] = useState(0);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const result = await enrollmentService.getMyEnrollments();

      if (result.success && result.data?.enrollments) {
        const enrollmentData = result.data.enrollments;
        setEnrollments(enrollmentData);

        // Calculate completed courses count
        const completedCourses = enrollmentData.filter(
          (e: any) => e.status === "completed",
        ).length;
        setCompletedCount(completedCourses);
        console.log(`✓ Completed Courses: ${completedCourses}`);

        // Calculate total learning time (sum of all course durations)
        const totalMinutes = enrollmentData.reduce(
          (acc: number, enrollment: any) => {
            const courseDuration = enrollment.course?.duration || 0;
            return acc + courseDuration;
          },
          0,
        );

        // Convert minutes to hours
        const totalHours = Math.round(totalMinutes / 60);
        setTotalLearningTime(totalHours);
        console.log(
          `⏱️ Total Learning Time: ${totalMinutes} minutes = ${totalHours} hours`,
        );
      }
    } catch (error) {
      console.error("Failed to load enrollments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Learning</h1>
        <p className="text-gray-600">
          Track your progress and continue learning
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="card p-6">
          <div className="text-4xl mb-2">📚</div>
          <div className="text-3xl font-bold text-primary-600">
            {enrollments.length}
          </div>
          <div className="text-gray-600">Enrolled Courses</div>
        </div>
        <div className="card p-6">
          <div className="text-4xl mb-2">✓</div>
          <div className="text-3xl font-bold text-green-600">
            {completedCount}
          </div>
          <div className="text-gray-600">Completed Courses</div>
        </div>
        <div className="card p-6">
          <div className="text-4xl mb-2">⏱️</div>
          <div className="text-3xl font-bold text-secondary-600">
            {totalLearningTime}h
          </div>
          <div className="text-gray-600">Learning Time</div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Continue Learning</h2>
        {loading ? (
          <div className="text-center py-12">Loading your courses...</div>
        ) : enrollments.length === 0 ? (
          <div className="card text-center py-12 p-6">
            <p className="text-gray-600 mb-4">
              You haven't enrolled in any courses yet
            </p>
            <Link href="/courses" className="btn-primary">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              if (!course) return null;

              return (
                <div key={enrollment.id} className="card p-6">
                  {course.thumbnail ? (
                    <img
                      src={
                        course.thumbnail.startsWith("http")
                          ? course.thumbnail
                          : `${BACKEND_URL}${course.thumbnail}`
                      }
                      alt={course.title}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-lg mb-4 flex items-center justify-center text-white text-3xl font-bold">
                      {course.title.charAt(0)}
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    By{" "}
                    {course.tutor
                      ? `${course.tutor.firstName} ${course.tutor.lastName}`
                      : "Instructor"}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{enrollment.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600"
                        style={{ width: `${enrollment.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs rounded-full ${
                        enrollment.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : enrollment.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {enrollment.status === "completed"
                        ? "✓ Completed"
                        : enrollment.status === "in_progress"
                          ? "▶ In Progress"
                          : "📚 Enrolled"}
                    </span>
                  </div>

                  <Link
                    href={`/student/learn/${course.id}`}
                    className="btn-primary w-full text-center"
                  >
                    {enrollment.status === "completed"
                      ? "Review Course"
                      : "Continue Learning"}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
