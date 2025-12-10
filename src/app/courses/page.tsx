"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { courseService } from "@/services/course.service";
import type { Course } from "@/types";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    level: "",
  });

  useEffect(() => {
    loadCourses();
  }, [filters]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      // For now, show mock data until backend is connected
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
        {
          id: "2",
          title: "Data Science Fundamentals",
          description: "Learn data science from scratch",
          thumbnail: "",
          price: 149.99,
          tutorId: "tutor2",
          tutorName: "Jane Smith",
          category: "Data Science",
          level: "intermediate",
          duration: 1800,
          enrolledCount: 200,
          rating: 4.8,
          reviewCount: 67,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Mobile App Development",
          description: "Build mobile apps with React Native",
          thumbnail: "",
          price: 129.99,
          tutorId: "tutor3",
          tutorName: "Mike Johnson",
          category: "Mobile Development",
          level: "intermediate",
          duration: 1500,
          enrolledCount: 120,
          rating: 4.6,
          reviewCount: 38,
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

  const categories = ["Web Development", "Data Science", "Mobile Development", "Design", "Business"];
  const levels = ["beginner", "intermediate", "advanced"];

  return (
    <div className="container-custom py-8">
      <h1 className="text-4xl font-bold mb-8">Browse Courses</h1>

      {/* Filters */}
      <div className="mb-8 grid md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search courses..."
          className="input-field"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="input-field"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          className="input-field"
          value={filters.level}
          onChange={(e) => setFilters({ ...filters, level: e.target.value })}
        >
          <option value="">All Levels</option>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>
        <button
          className="btn-primary"
          onClick={() => setFilters({ search: "", category: "", level: "" })}
        >
          Clear Filters
        </button>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="text-center py-12">Loading courses...</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="card">
              <div className="w-full h-48 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-lg mb-4 flex items-center justify-center text-white text-2xl font-bold">
                {course.title.charAt(0)}
              </div>
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {course.description}
              </p>
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                <span>👨‍🏫 {course.tutorName}</span>
              </div>
              <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                <span>⭐ {course.rating}</span>
                <span>({course.reviewCount} reviews)</span>
                <span>•</span>
                <span>{course.enrolledCount} students</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {course.level}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {course.category}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-2xl font-bold text-primary-600">
                  ${course.price}
                </span>
                <Link href={`/courses/${course.id}`} className="btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
