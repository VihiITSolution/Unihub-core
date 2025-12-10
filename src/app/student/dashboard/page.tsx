"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Course, Enrollment } from "@/types";

export default function StudentDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrolledCourses();
  }, []);

  const loadEnrolledCourses = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockCourses: Course[] = [
        {
          id: "1",
          title: "Web Development Bootcamp",
          description: "Complete guide to modern web development",
          thumbnail: "",
          price: 99.99,
          tutorId: "tutor1",
          tutorName: "John Doe",
          category: "Web Development",
          level: "beginner",
          duration: 1200,
          enrolledCount: 150,
          rating: 4.5,
          reviewCount: 45,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setEnrolledCourses(mockCourses);
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Learning</h1>
        <p className="text-gray-600">Track your progress and continue learning</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="card">
          <div className="text-4xl mb-2">📚</div>
          <div className="text-3xl font-bold text-primary-600">
            {enrolledCourses.length}
          </div>
          <div className="text-gray-600">Enrolled Courses</div>
        </div>
        <div className="card">
          <div className="text-4xl mb-2">✓</div>
          <div className="text-3xl font-bold text-green-600">0</div>
          <div className="text-gray-600">Completed Courses</div>
        </div>
        <div className="card">
          <div className="text-4xl mb-2">⏱️</div>
          <div className="text-3xl font-bold text-secondary-600">0h</div>
          <div className="text-gray-600">Learning Time</div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Continue Learning</h2>
        {loading ? (
          <div className="text-center py-12">Loading your courses...</div>
        ) : enrolledCourses.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">
              You haven&apos;t enrolled in any courses yet
            </p>
            <Link href="/courses" className="btn-primary">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="card">
                <div className="w-full h-40 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-lg mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  {course.title.charAt(0)}
                </div>
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  By {course.tutorName}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600"
                      style={{ width: "25%" }}
                    ></div>
                  </div>
                </div>

                <Link
                  href={`/student/learn/${course.id}`}
                  className="btn-primary w-full text-center"
                >
                  Continue Learning
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-6">Recommended for You</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="w-full h-40 bg-gradient-to-r from-secondary-400 to-primary-400 rounded-lg mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">
                Advanced Course {i}
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Take your skills to the next level
              </p>
              <Link href={`/courses/${i}`} className="text-primary-600 hover:underline">
                View Course →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
