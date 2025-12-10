"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Course } from "@/types";

export default function TutorDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTutorCourses();
  }, []);

  const loadTutorCourses = async () => {
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
      setCourses(mockCourses);
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Tutor Dashboard</h1>
          <p className="text-gray-600">Manage your courses and track performance</p>
        </div>
        <Link href="/tutor/create-course" className="btn-primary">
          + Create New Course
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="card">
          <div className="text-4xl mb-2">📚</div>
          <div className="text-3xl font-bold text-primary-600">
            {courses.length}
          </div>
          <div className="text-gray-600">Total Courses</div>
        </div>
        <div className="card">
          <div className="text-4xl mb-2">👥</div>
          <div className="text-3xl font-bold text-green-600">
            {courses.reduce((acc, c) => acc + c.enrolledCount, 0)}
          </div>
          <div className="text-gray-600">Total Students</div>
        </div>
        <div className="card">
          <div className="text-4xl mb-2">⭐</div>
          <div className="text-3xl font-bold text-yellow-600">4.5</div>
          <div className="text-gray-600">Average Rating</div>
        </div>
        <div className="card">
          <div className="text-4xl mb-2">💰</div>
          <div className="text-3xl font-bold text-secondary-600">
            ${(courses.reduce((acc, c) => acc + c.enrolledCount * c.price, 0)).toFixed(2)}
          </div>
          <div className="text-gray-600">Total Revenue</div>
        </div>
      </div>

      {/* Courses List */}
      <div>
        <h2 className="text-3xl font-bold mb-6">My Courses</h2>
        {loading ? (
          <div className="text-center py-12">Loading your courses...</div>
        ) : courses.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">
              You haven&apos;t created any courses yet
            </p>
            <Link href="/tutor/create-course" className="btn-primary">
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="card">
                <div className="flex gap-6">
                  <div className="w-48 h-32 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-lg flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                    {course.title.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span>{course.enrolledCount} students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⭐</span>
                        <span>{course.rating} ({course.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>💰</span>
                        <span>${course.price}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/tutor/edit-course/${course.id}`}
                      className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 text-center"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/courses/${course.id}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center"
                    >
                      View
                    </Link>
                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-6">Recent Activity</h2>
        <div className="card">
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold">New enrollment</p>
                <p className="text-sm text-gray-600">
                  Student enrolled in &quot;Web Development Bootcamp&quot;
                </p>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600">⭐</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold">New review</p>
                <p className="text-sm text-gray-600">
                  5-star review on &quot;Web Development Bootcamp&quot;
                </p>
              </div>
              <span className="text-sm text-gray-500">5 hours ago</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600">💰</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold">Payment received</p>
                <p className="text-sm text-gray-600">
                  Earned $99.99 from course enrollment
                </p>
              </div>
              <span className="text-sm text-gray-500">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
