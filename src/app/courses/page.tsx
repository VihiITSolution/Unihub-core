"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Card, Badge, Input, Loading } from "@/components/ui";
import { courseService } from "@/services/course.service";
import { useAuth } from "@/contexts/AuthContext";
import type { Course } from "@/types";
import { API_BASE_URL, BACKEND_URL } from "@/lib/constants";

export default function CoursesPage() {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const categories = [
    { id: "all", name: "All Categories", icon: "📚" },
    { id: "Engineering", name: "Engineering", icon: "⚙️" },
    { id: "Medicine", name: "Medicine", icon: "🩺" },
    { id: "IT & Computing", name: "IT & Computing", icon: "💻" },
    { id: "Business & Management", name: "Business & Management", icon: "💼" },
    { id: "Science", name: "Science", icon: "🔬" },
    { id: "Arts & Humanities", name: "Arts & Humanities", icon: "📚" },
  ];

  const levels = ["all", "beginner", "intermediate", "advanced"];
  const priceRanges = [
    { id: "all", label: "All Prices" },
    { id: "free", label: "Free" },
    { id: "under1000", label: "Under Rs. 1000" },
    { id: "1000to2000", label: "Rs. 1000 - 2000" },
    { id: "over2000", label: "Over Rs. 2000" },
  ];

  useEffect(() => {
    loadCourses();
  }, [
    selectedCategory,
    selectedLevel,
    priceRange,
    sortBy,
    searchQuery,
    pagination.page,
    token,
  ]);

  const loadCourses = async () => {
    try {
      setLoading(true);

      const filters: any = {};
      if (selectedCategory !== "all") filters.category = selectedCategory;
      if (selectedLevel !== "all") filters.level = selectedLevel;
      if (searchQuery) filters.search = searchQuery;

      // Price range logic (simplified mapping)
      if (priceRange !== "all") {
        if (priceRange === "free") {
          filters.maxPrice = 0;
        } else if (priceRange === "under50") {
          filters.maxPrice = 50;
        } else if (priceRange === "50to100") {
          filters.minPrice = 50;
          filters.maxPrice = 100;
        } else if (priceRange === "over100") {
          filters.minPrice = 100;
        }
      }

      // Fetch with authentication header if user is logged in
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

      const response = await fetch(`${API_BASE_URL}/courses${query}`, {
        headers,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const coursesData = Array.isArray(result.data)
            ? result.data
            : result.data.courses || [];
          setCourses(coursesData);
        } else {
          console.error("Failed to fetch courses:", result.message);
          setCourses([]);
        }
      } else {
        console.error("Failed to fetch courses:", response.status);
        setCourses([]);
      }
    } catch (error) {
      console.error("Failed to load courses:", error);
      setError(error.message || "Failed to load courses. Please try again.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container-custom">
          <h1 className="heading-1 mb-4">Explore Our Courses</h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Discover thousands of courses taught by expert instructors. Learn
            new skills and advance your career.
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <Card padding="lg" className="sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Filters</h3>

              {/* Search */}
              <div className="mb-6">
                <Input
                  name="search"
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  }
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedCategory === cat.id
                          ? "bg-primary-100 text-primary-700 font-medium"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="text-sm">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Level</h4>
                <div className="space-y-2">
                  {levels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedLevel === level
                          ? "bg-primary-100 text-primary-700 font-medium"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {level === "all"
                        ? "All Levels"
                        : level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price</h4>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setPriceRange(range.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        priceRange === range.id
                          ? "bg-primary-100 text-primary-700 font-medium"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedLevel("all");
                  setPriceRange("all");
                  setSearchQuery("");
                }}
              >
                Clear All
              </Button>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{courses.length}</span>{" "}
                courses
              </p>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loading size="lg" text="Loading courses..." />
              </div>
            ) : error ? (
              <Card
                padding="lg"
                className="text-center py-12 bg-red-50 border-red-200"
              >
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold mb-2 text-red-900">
                  Failed to load courses
                </h3>
                <p className="text-red-700 mb-4">{error}</p>
                <Button onClick={loadCourses} variant="primary">
                  Try Again
                </Button>
              </Card>
            ) : courses.length === 0 ? (
              <Card padding="lg" className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters to see more results
                </p>
              </Card>
            ) : (
              /* Courses Grid */
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Link key={course.id} href={`/courses/${course.id}`}>
                    <Card hover padding="sm" className="h-full group">
                      <div className="relative overflow-hidden rounded-lg mb-4">
                        <img
                          src={
                            course.thumbnail &&
                            course.thumbnail.startsWith("http")
                              ? course.thumbnail
                              : `${BACKEND_URL}${course.thumbnail || ""}`
                          }
                          alt={course.title}
                          className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop&q=80";
                          }}
                        />
                        {course.rating && course.rating > 0 && (
                          <Badge
                            variant="warning"
                            className="absolute top-3 left-3 bg-yellow-400 text-gray-900"
                          >
                            ⭐ {Number(course.rating).toFixed(1)}
                          </Badge>
                        )}
                        <Badge
                          variant="gray"
                          className="absolute top-3 right-3 bg-white capitalize"
                        >
                          {course.level}
                        </Badge>
                      </div>

                      <div className="p-4">
                        <Badge variant="primary" size="sm" className="mb-2">
                          {course.category}
                        </Badge>

                        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                          {course.title}
                        </h3>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {course.description}
                        </p>

                        <p className="text-sm text-gray-600 mb-3">
                          By{" "}
                          {course.tutorName ||
                            (course.tutor
                              ? `${course.tutor.firstName} ${course.tutor.lastName}`
                              : "Instructor")}
                        </p>

                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                            {(course.enrolledCount || 0).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                            </svg>
                            {formatDuration(course.duration)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <span className="text-2xl font-bold text-gray-900">
                              Rs. {course.price}
                            </span>
                          </div>
                          {user && course.tutorId === user.id ? (
                            <Link href={`/tutor/edit-course/${course.id}`}>
                              <Button variant="secondary" size="sm">
                                Manage
                              </Button>
                            </Link>
                          ) : course.isEnrolled ? (
                            <Link href={`/student/learn/${course.id}`}>
                              <Button variant="success" size="sm">
                                {course.price === 0
                                  ? "View Course"
                                  : "Watch Now"}
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              variant={
                                user && course.tutorId === user.id
                                  ? "secondary"
                                  : "primary"
                              }
                              size="sm"
                            >
                              {user && course.tutorId === user.id
                                ? "View"
                                : "Enroll Now"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading &&
              !error &&
              courses.length > 0 &&
              pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (
                          pagination.page >=
                          pagination.totalPages - 2
                        ) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: pageNum,
                              }))
                            }
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                              pagination.page === pageNum
                                ? "bg-primary-600 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      },
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
          </main>
        </div>
      </div>
    </div>
  );
}
