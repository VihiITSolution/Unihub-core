"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Badge, Button } from "@/components/ui";
import type { Course } from "@/types";
import { API_BASE_URL } from "@/lib/constants";

interface CategoryTab {
  id: string;
  name: string;
}

interface CoursesGrouped {
  [key: string]: Course[];
}

export default function FeaturedCoursesCarousel() {
  const { user, token, isAuthenticated } = useAuth();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [groupedCourses, setGroupedCourses] = useState<CoursesGrouped>({});
  const [categories, setCategories] = useState<CategoryTab[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    loadAllCourses();
  }, [isAuthenticated, token]);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [groupedCourses, activeCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        scrollLeft();
      } else if (e.key === "ArrowRight") {
        scrollRight();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollContainerRef]);

  const loadAllCourses = async () => {
    try {
      setLoading(true);

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Fetch all courses without limit
      const response = await fetch(`${API_BASE_URL}/courses?limit=100&page=1`, {
        headers,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const coursesData = (result.data as any).courses || result.data;
          setAllCourses(coursesData);

          // Group courses by faculty
          const grouped: CoursesGrouped = {};
          const categorySet = new Set<string>();

          coursesData.forEach((course: Course) => {
            const categoryKey =
              course.faculty?.name || course.category || "Other";
            if (!grouped[categoryKey]) {
              grouped[categoryKey] = [];
            }
            grouped[categoryKey].push(course);
            categorySet.add(categoryKey);
          });

          setGroupedCourses(grouped);

          // Create category tabs
          const tabs: CategoryTab[] = [
            { id: "all", name: "All Categories" },
            ...Array.from(categorySet).map((cat) => ({
              id: cat.toLowerCase().replace(/\s+/g, "-"),
              name: cat,
            })),
          ];

          setCategories(tabs);
        }
      }
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Card width + gap
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });

      setTimeout(checkScroll, 300);
    }
  };

  const scrollLeft = () => scroll("left");
  const scrollRight = () => scroll("right");

  const getCoursesToDisplay = (): Course[] => {
    if (activeCategory === "all") {
      return allCourses;
    }

    const categoryName = Object.keys(groupedCourses).find(
      (cat) => cat.toLowerCase().replace(/\s+/g, "-") === activeCategory,
    );

    return categoryName ? groupedCourses[categoryName] : [];
  };

  const coursesToDisplay = getCoursesToDisplay();

  return (
    <section className="section">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-12">
          <h2 className="heading-2 text-gray-900 mb-2">
            Master Your Modules & Ace Your Exams
          </h2>
          <p className="text-lg text-gray-600">
            Join university students covering hard lessons and difficult
            modules. Get peer-to-peer kuppi sessions to prepare for exams.
          </p>
        </div>

        {/* Category Tabs and Explore Button */}
        {categories.length > 0 && (
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 pb-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setTimeout(checkScroll, 100);
                    }}
                    className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all duration-300 ${
                      activeCategory === category.id
                        ? "bg-primary-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            <Link href="/courses" className="flex-shrink-0">
              <Button variant="outline">Explore All</Button>
            </Link>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : coursesToDisplay.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-600">
              No courses available in this category yet
            </p>
          </div>
        ) : (
          <div className="relative group">
            {/* Carousel Container */}
            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide snap-x snap-mandatory"
            >
              {coursesToDisplay.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="flex-shrink-0 w-80 snap-center"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 h-full flex flex-col group/card border border-gray-100">
                    {/* Image Container */}
                    <div className="relative overflow-hidden bg-gray-200 h-48">
                      <img
                        src={
                          course.thumbnail ||
                          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=280&fit=crop&q=80"
                        }
                        alt={course.title}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=280&fit=crop&q=80";
                        }}
                      />

                      {/* Rating Badge */}
                      {course.rating && course.rating > 0 && (
                        <div className="absolute top-3 left-3 bg-white rounded-lg px-3 py-1 shadow-md">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-gray-900">
                              {Number(course.rating).toFixed(1)}
                            </span>
                            <span className="text-yellow-400">★</span>
                          </div>
                        </div>
                      )}

                      {/* Year/Level Badge */}
                      {course.year ? (
                        <Badge className="absolute top-3 right-3 bg-purple-600 text-white">
                          Year {course.year}
                        </Badge>
                      ) : (
                        course.level && (
                          <Badge className="absolute top-3 right-3 bg-gray-900 text-white capitalize">
                            {course.level}
                          </Badge>
                        )
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      {/* Faculty/Category */}
                      {course.faculty ? (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {{
                              "IT & Computing": "💻",
                              Engineering: "⚙️",
                              Medicine: "🩺",
                              "Business & Management": "💼",
                              Science: "🔬",
                              "Arts & Humanities": "📚",
                            }[course.faculty.name] || "📚"}
                          </span>
                          <Badge variant="primary" size="sm">
                            {course.faculty.name}
                          </Badge>
                        </div>
                      ) : null}

                      {/* Title */}
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm group-hover/card:text-primary-600 transition-colors">
                        {course.title}
                      </h3>

                      {/* Tutor Name */}
                      <p className="text-xs text-gray-600 mb-3 font-medium">
                        by{" "}
                        {course.tutor
                          ? `${course.tutor.firstName} ${course.tutor.lastName}`
                          : course.tutorName || "Unknown Instructor"}
                      </p>

                      {/* Rating and Reviews */}
                      <div className="flex items-center gap-2 mb-4 text-xs">
                        {course.rating && course.rating > 0 && (
                          <>
                            <div className="flex text-yellow-400">
                              {"★".repeat(Math.floor(Number(course.rating)))}
                            </div>
                            <span className="text-gray-600">
                              ({(course.enrollmentCount || 0).toLocaleString()})
                            </span>
                          </>
                        )}
                      </div>

                      {/* Price and Enroll Button */}
                      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          Rs. {course.price}
                        </span>
                        {user && course.tutorId === user.id ? (
                          <Link href={`/tutor/edit-course/${course.id}`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="text-xs"
                            >
                              Manage
                            </Button>
                          </Link>
                        ) : course.isEnrolled ? (
                          <Link href={`/student/learn/${course.id}`}>
                            <Button
                              variant="success"
                              size="sm"
                              className="text-xs"
                            >
                              {course.price === 0 ? "View" : "Watch Now"}
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-xs"
                          >
                            Enroll
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Left Arrow Button */}
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className="absolute -left-5 top-1/3 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Scroll left"
              >
                <svg
                  className="w-6 h-6 text-gray-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* Right Arrow Button */}
            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="absolute -right-5 top-1/3 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Scroll right"
              >
                <svg
                  className="w-6 h-6 text-gray-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
