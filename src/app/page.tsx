"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card, Badge } from "@/components/ui";
import { courseService } from "@/services/course.service";
import { useAuth } from "@/contexts/AuthContext";
import type { Course } from "@/types";
import { API_BASE_URL } from "@/lib/constants";

export default function Home() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedCourses();
  }, [isAuthenticated, token]);

  const loadFeaturedCourses = async () => {
    try {
      setLoading(true);

      // Fetch with authentication header if user is logged in
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/courses?limit=3&page=1`, {
        headers,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const coursesData = (result.data as any).courses || result.data;
          setFeaturedCourses(coursesData.slice(0, 3));
        }
      }
    } catch (error) {
      console.error("Failed to load featured courses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler for Create Kuppi button
  const handleCreateKuppi = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      // Not logged in - go to registration
      router.push("/auth/register");
      return;
    }

    // Check if user is a tutor
    if (user?.roles?.includes("tutor")) {
      // User is a tutor - go to create course
      router.push("/tutor/create-course");
    } else {
      // User is not a tutor - go to become tutor form
      router.push("/student/become-tutor");
    }
  };

  const categories = [
    {
      name: "IT & Computing",
      icon: "💻",
      courses: 312,
      color: "bg-purple-100 text-purple-700",
    },
    {
      name: "Engineering",
      icon: "⚙️",
      courses: 245,
      color: "bg-blue-100 text-blue-700",
    },
    {
      name: "Medicine",
      icon: "🩺",
      courses: 189,
      color: "bg-green-100 text-green-700",
    },

    {
      name: "Business & Management",
      icon: "💼",
      courses: 198,
      color: "bg-pink-100 text-pink-700",
    },
    {
      name: "Science",
      icon: "🔬",
      courses: 156,
      color: "bg-orange-100 text-orange-700",
    },
    {
      name: "Arts & Humanities",
      icon: "📚",
      courses: 134,
      color: "bg-indigo-100 text-indigo-700",
    },
  ];

  const stats = [
    { value: "5K+", label: "Active Students" },
    { value: "50+", label: "Student Tutors" },
    { value: "100+", label: "Kuppi Sessions" },
    { value: "4.8/5", label: "Average Rating" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero py-20 lg:py-28">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge variant="primary" className="mb-6">
                Sri Lanka's #1 University Student Platform
              </Badge>
              <h1 className="heading-1 text-gray-900 mb-6">
                Kuppi Sessions & Academic Marketplace for University Students
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Join thousands of Sri Lankan university students. Access
                peer-led kuppi sessions, master complex modules, and buy/sell
                academic supplies - all in one platform.
              </p>
              <div className="mb-8 rounded-xl border border-primary-100 bg-white/80 p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  UniHub is a web platform for Sri Lankan university students to
                  learn through peer-led kuppi sessions, teach and earn as
                  tutors, and buy or sell academic essentials in one place.
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <Link
                    href="/privacy"
                    className="text-primary-700 hover:text-primary-800 underline"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    className="text-primary-700 hover:text-primary-800 underline"
                  >
                    Terms of Service
                  </Link>
                </div>
              </div>
              <div className="flex gap-4 flex-wrap">
                <Link href="/courses">
                  <Button variant="primary" size="lg">
                    Browse Kuppi Sessions
                  </Button>
                </Link>
                <button
                  onClick={handleCreateKuppi}
                  className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Create Kuppi
                </button>
              </div>

              {/* Trust Indicators */}
              {/* <div className="mt-12 flex items-center gap-8 flex-wrap">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-yellow-500 text-lg mb-1">
                    {"★".repeat(5)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Trusted by 5,000+ university students
                  </p>
                </div>
              </div> */}
            </div>

            <div className="relative animate-slide-up hidden lg:block">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=500&fit=crop&q=80"
                  alt="Sri Lankan University Students Learning"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {/* <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="heading-2 text-gray-900 mb-4">
              Popular University Faculties
            </h2>
            <p className="text-lg text-gray-600">
              Find kuppi sessions for your degree program
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Card
                key={category.name}
                hover
                padding="md"
                className="text-center cursor-pointer group"
              >
                <div
                  className={`text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-200`}
                >
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {category.courses} courses
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Featured Courses */}
      <section className="section">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="heading-2 text-gray-900 mb-2">
                Featured Kuppi Sessions
              </h2>
              <p className="text-gray-600">
                Popular sessions by fellow students
              </p>
            </div>
            <Link href="/courses">
              <Button variant="outline">View All Sessions</Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : featuredCourses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No courses available yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <Card hover padding="sm" className="group">
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <img
                        src={
                          course.thumbnail ||
                          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop&q=80"
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
                          className="absolute top-3 left-3"
                        >
                          ⭐ {Number(course.rating).toFixed(1)}
                        </Badge>
                      )}
                      {course.year ? (
                        <Badge
                          variant="gray"
                          className="absolute top-3 right-3 bg-purple-100 text-purple-700 font-medium"
                        >
                          Year {course.year}
                        </Badge>
                      ) : (
                        course.level && (
                          <Badge
                            variant="gray"
                            className="absolute top-3 right-3 bg-white capitalize"
                          >
                            {course.level}
                          </Badge>
                        )
                      )}
                    </div>

                    <div className="p-4">
                      {course.faculty ? (
                        <Badge variant="primary" size="sm" className="mb-2">
                          {course.faculty.name}
                        </Badge>
                      ) : (
                        course.category && (
                          <Badge variant="primary" size="sm" className="mb-2">
                            {course.category}
                          </Badge>
                        )
                      )}
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {course.tutor
                          ? `${course.tutor.firstName} ${course.tutor.lastName}`
                          : "Unknown Instructor"}
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        {course.rating && course.rating > 0 && (
                          <>
                            <span className="font-bold text-yellow-500">
                              {Number(course.rating).toFixed(1)}
                            </span>
                            <div className="flex text-yellow-500 text-sm">
                              {"★".repeat(Math.floor(Number(course.rating)))}
                            </div>
                          </>
                        )}
                        <span className="text-sm text-gray-600">
                          ({(course.enrollmentCount || 0).toLocaleString()})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
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
                              {course.price === 0 ? "View Course" : "Watch Now"}
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="primary" size="sm">
                            Enroll Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8">
            <Card hover padding="lg" className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                📚
              </div>
              <h3 className="heading-4 text-gray-900 mb-3">Learn from Peers</h3>
              <p className="text-gray-600 leading-relaxed">
                Access peer-led kuppi sessions created by fellow university
                students who've mastered the modules you're studying.
              </p>
              <Link
                href="/courses"
                className="text-primary-600 hover:text-primary-700 font-medium mt-4 inline-flex items-center gap-2"
              >
                Browse Kuppis
                <svg
                  className="w-4 h-4"
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
              </Link>
            </Card>

            <Card hover padding="lg" className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                🎓
              </div>
              <h3 className="heading-4 text-gray-900 mb-3">Create Kuppi</h3>
              <p className="text-gray-600 leading-relaxed">
                Share your knowledge with fellow students and earn while helping
                them ace their exams and assignments.
              </p>
              <Link
                href="/tutor/dashboard"
                className="text-primary-600 hover:text-primary-700 font-medium mt-4 inline-flex items-center gap-2"
              >
                Start Teaching
                <svg
                  className="w-4 h-4"
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
              </Link>
            </Card>

            <Card hover padding="lg" className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                🛒
              </div>
              <h3 className="heading-4 text-gray-900 mb-3">
                Academic Marketplace
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Buy and sell university essentials - calculators, drawing
                instruments, textbooks, electronics, and more.
              </p>
              <Link
                href="/marketplace"
                className="text-primary-600 hover:text-primary-700 font-medium mt-4 inline-flex items-center gap-2"
              >
                Visit Marketplace
                <svg
                  className="w-4 h-4"
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
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section gradient-primary text-white">
        <div className="container-custom text-center">
          <h2 className="heading-2 mb-6">
            Ready to Ace Your University Exams?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join UniHub today and get access to peer-led kuppi sessions,
            simplified module guides, and connect with fellow Sri Lankan
            university students.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {!isAuthenticated && (
              <Link href="/auth/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-100"
                >
                  Join Free
                </Button>
              </Link>
            )}
            <Link href="/courses">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary-600"
              >
                Browse Kuppi Sessions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
