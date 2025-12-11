"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Card, Badge, Input, Loading } from "@/components/ui";
import { courseService } from "@/services/course.service";
import type { Course } from "@/types";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", name: "All Categories", icon: "📚" },
    { id: "web-dev", name: "Web Development", icon: "💻" },
    { id: "data-science", name: "Data Science", icon: "📊" },
    { id: "business", name: "Business", icon: "💼" },
    { id: "design", name: "Design", icon: "🎨" },
    { id: "marketing", name: "Marketing", icon: "📈" },
  ];

  const levels = ["all", "beginner", "intermediate", "advanced"];
  const priceRanges = [
    { id: "all", label: "All Prices" },
    { id: "free", label: "Free" },
    { id: "under50", label: "Under $50" },
    { id: "50to100", label: "$50 - $100" },
    { id: "over100", label: "Over $100" },
  ];

  useEffect(() => {
    loadCourses();
  }, [selectedCategory, selectedLevel, priceRange, sortBy, searchQuery]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockCourses: Course[] = [
        {
          id: "1",
          title: "Complete Web Development Bootcamp 2024",
          description: "Master HTML, CSS, JavaScript, React, Node.js and more",
          thumbnail: "https://via.placeholder.com/400x250",
          price: 49.99,
          tutorId: "tutor1",
          tutorName: "John Doe",
          category: "Web Development",
          level: "beginner",
          duration: 3600,
          enrolledCount: 12450,
          rating: 4.8,
          reviewCount: 2341,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Advanced Python Programming",
          description: "Deep dive into Python with real-world projects",
          thumbnail: "https://via.placeholder.com/400x250",
          price: 39.99,
          tutorId: "tutor2",
          tutorName: "Jane Smith",
          category: "Data Science",
          level: "advanced",
          duration: 2400,
          enrolledCount: 8934,
          rating: 4.9,
          reviewCount: 1567,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          title: "UI/UX Design Masterclass",
          description: "Complete guide to user interface and experience design",
          thumbnail: "https://via.placeholder.com/400x250",
          price: 59.99,
          tutorId: "tutor3",
          tutorName: "Mike Johnson",
          category: "Design",
          level: "intermediate",
          duration: 2100,
          enrolledCount: 6721,
          rating: 4.7,
          reviewCount: 892,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "4",
          title: "Digital Marketing Strategy",
          description: "Master SEO, social media, and content marketing",
          thumbnail: "https://via.placeholder.com/400x250",
          price: 44.99,
          tutorId: "tutor4",
          tutorName: "Sarah Williams",
          category: "Marketing",
          level: "beginner",
          duration: 1800,
          enrolledCount: 5432,
          rating: 4.6,
          reviewCount: 678,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "5",
          title: "Machine Learning A-Z",
          description: "Hands-on Python & R in data science",
          thumbnail: "https://via.placeholder.com/400x250",
          price: 89.99,
          tutorId: "tutor5",
          tutorName: "David Chen",
          category: "Data Science",
          level: "advanced",
          duration: 4200,
          enrolledCount: 9876,
          rating: 4.8,
          reviewCount: 1923,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "6",
          title: "Business Analytics & Intelligence",
          description: "Data-driven decision making for business",
          thumbnail: "https://via.placeholder.com/400x250",
          price: 54.99,
          tutorId: "tutor6",
          tutorName: "Emily Davis",
          category: "Business",
          level: "intermediate",
          duration: 1950,
          enrolledCount: 4321,
          rating: 4.5,
          reviewCount: 543,
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
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-300"
                        />
                        <Badge
                          variant="warning"
                          className="absolute top-3 left-3 bg-yellow-400 text-gray-900"
                        >
                          ⭐ {course.rating}
                        </Badge>
                        <Badge
                          variant="gray"
                          className="absolute top-3 right-3 bg-white"
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
                          By {course.tutorName}
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
                            {course.enrolledCount.toLocaleString()}
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
                              ${course.price}
                            </span>
                          </div>
                          <Button variant="primary" size="sm">
                            Enroll Now
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
