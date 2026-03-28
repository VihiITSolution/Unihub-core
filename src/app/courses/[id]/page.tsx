"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL, BACKEND_URL } from "@/lib/constants";
import type { Course, CourseContent, CourseReview } from "@/types";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const courseId = params?.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "reviews" | "content">(
    "about",
  );

  useEffect(() => {
    if (courseId) {
      loadCourseDetails();
    }
  }, [courseId, token]);

  const loadCourseDetails = async () => {
    if (!courseId) {
      setError("Course ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch real course data
      const courseResponse = await fetch(`${API_BASE_URL}/courses/${courseId}`);

      if (!courseResponse.ok) {
        throw new Error(`Failed to fetch course: ${courseResponse.status}`);
      }

      const courseData = await courseResponse.json();

      if (courseData.success && courseData.data) {
        setCourse(courseData.data.course);
      } else {
        setError(courseData.message || "Failed to load course");
      }

      // Fetch course content
      const contentResponse = await fetch(
        `${API_BASE_URL}/courses/${courseId}/content`,
      );

      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        if (contentData.success && contentData.data) {
          setContents(contentData.data.contents || []);
        }
      }

      // Fetch reviews - Try to fetch from backend, fallback to demo reviews
      try {
        const reviewsResponse = await fetch(
          `${API_BASE_URL}/courses/${courseId}/reviews`,
        );

        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          if (reviewsData.success && reviewsData.data) {
            setReviews(reviewsData.data.reviews || []);
          }
        } else {
          // Fallback to demo reviews if endpoint doesn't exist
          setReviews(getDemoReviews());
        }
      } catch (reviewError) {
        console.log("Reviews endpoint not available, using demo reviews");
        setReviews(getDemoReviews());
      }

      // Check if user is enrolled (if authenticated)
      if (isAuthenticated && token) {
        try {
          const enrollmentResponse = await fetch(
            `${API_BASE_URL}/enrollments`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (enrollmentResponse.ok) {
            const enrollmentData = await enrollmentResponse.json();
            if (
              enrollmentData.success &&
              enrollmentData.data &&
              Array.isArray(enrollmentData.data.enrollments)
            ) {
              const courseIdNum = parseInt(courseId, 10);
              const enrolled = enrollmentData.data.enrollments.some(
                (enrollment: any) =>
                  parseInt(String(enrollment.courseId), 10) === courseIdNum,
              );
              setIsEnrolled(enrolled);
            }
          }
        } catch (enrollmentError) {
          console.error("Failed to check enrollment:", enrollmentError);
        }
      }
    } catch (error) {
      console.error("Failed to load course:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load course",
      );
    } finally {
      setLoading(false);
    }
  };

  const getDemoReviews = (): CourseReview[] => {
    return [
      {
        id: "1",
        courseId: courseId,
        userId: "user1",
        userName: "Sarah Johnson",
        userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        rating: 5,
        title: "Excellent course! Very comprehensive",
        comment:
          "This course was exactly what I needed. The instructor explains concepts clearly and the materials are well-organized. I learned so much!",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        helpful: 24,
      },
      {
        id: "2",
        courseId: courseId,
        userId: "user2",
        userName: "Mike Chen",
        userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
        rating: 5,
        title: "Great practical examples",
        comment:
          "The real-world examples made it easy to understand how to apply the concepts. Highly recommended for beginners!",
        createdAt: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updatedAt: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        helpful: 18,
      },
      {
        id: "3",
        courseId: courseId,
        userId: "user3",
        userName: "Emily Rodriguez",
        userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
        rating: 4,
        title: "Good content, could use more exercises",
        comment:
          "The content is solid and well-explained. I would appreciate more practice exercises to reinforce the learning.",
        createdAt: new Date(
          Date.now() - 21 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updatedAt: new Date(
          Date.now() - 21 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        helpful: 12,
      },
      {
        id: "4",
        courseId: courseId,
        userId: "user4",
        userName: "David Kim",
        userImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        rating: 5,
        title: "Best course on this topic",
        comment:
          "Compared to other courses, this one stands out. The instructor is passionate and knows the subject deeply.",
        createdAt: new Date(
          Date.now() - 28 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updatedAt: new Date(
          Date.now() - 28 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        helpful: 32,
      },
    ];
  };

  const handleEnroll = async () => {
    // Check if user is logged in
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // If already enrolled, navigate to learn page
    if (isEnrolled) {
      router.push(`/student/learn/${courseId}`);
      return;
    }

    try {
      setIsEnrolling(true);
      // Save enrollment to backend
      const enrollResponse = await fetch(`${API_BASE_URL}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: parseInt(courseId),
        }),
      });

      if (!enrollResponse.ok) {
        const errorData = await enrollResponse.json();
        alert(errorData.message || "Failed to enroll in course");
        setIsEnrolling(false);
        return;
      }

      // Update state and show success modal
      setIsEnrolled(true);
      setShowSuccessModal(true);
      setIsEnrolling(false);
    } catch (error) {
      console.error("Enrollment error:", error);
      alert("An error occurred during enrollment");
      setIsEnrolling(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? "text-yellow-400" : "text-gray-300"}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        ).toFixed(1)
      : course?.rating || 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <div className="animate-pulse text-gray-600">
            Loading course details...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Link href="/courses" className="btn-primary">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <div className="mb-4">Course not found</div>
          <Link href="/courses" className="btn-primary">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  // Separate preview and enrolled materials
  const previewMaterials = contents.filter((content) => content.isPreview);
  const enrolledOnlyMaterials = contents.filter(
    (content) => !content.isPreview,
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Successfully Enrolled!
              </h2>
              <p className="text-gray-600 mb-4">
                Welcome to{" "}
                <span className="font-semibold text-primary-600">
                  {course?.title}
                </span>
                !
              </p>
              <p className="text-gray-600 text-sm mb-6">
                You now have full access to all course materials. Start learning
                and unlock your potential!
              </p>
            </div>
            <div className="flex gap-3 flex-col sm:flex-row">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition order-2 sm:order-1"
              >
                Continue Browsing
              </button>
              <Link
                href={`/student/learn/${courseId}`}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition order-1 sm:order-2"
              >
                Start Learning Now →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Course Header - Hero Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container-custom py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/courses"
              className="text-primary-600 hover:underline text-sm font-medium"
            >
              Courses
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 text-sm">{course.category}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {course.title}
          </h1>
          <p className="text-lg text-gray-600 mb-4">{course.description}</p>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-lg text-yellow-400">
                    ★
                  </span>
                ))}
              </div>
              <span className="font-semibold text-gray-900">
                {averageRating}
              </span>
              <span className="text-gray-600">({reviews.length} reviews)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span>👥</span>
              <span className="font-medium">
                {course.enrolledCount || course.enrollmentCount || 0} students
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span>⏱️</span>
              <span className="font-medium">
                {Math.floor((course.duration || 0) / 60)} hours
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Tab Navigation */}
            <div className="flex gap-8 border-b border-gray-200 mb-8">
              {["about", "reviews", "content"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`py-4 font-medium text-lg relative transition-colors ${
                    activeTab === tab
                      ? "text-primary-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab === "about" && "About"}
                  {tab === "reviews" && "Reviews"}
                  {tab === "content" && "Content"}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600"></div>
                  )}
                </button>
              ))}
            </div>

            {/* About Tab */}
            {activeTab === "about" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    About This Course
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {course.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    What You'll Learn
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Master the core concepts and fundamentals",
                      "Apply practical techniques in real-world scenarios",
                      "Build projects from scratch",
                      "Become confident in your skills",
                      "Get certified upon completion",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-green-500 text-xl font-bold mt-0.5">
                          ✓
                        </span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    About the Instructor
                  </h3>
                  <div className="flex gap-4 p-6 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {course.tutor?.firstName
                        ? course.tutor.firstName.charAt(0)
                        : course.tutorName?.charAt(0) || "T"}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">
                        {course.tutor
                          ? `${course.tutor.firstName} ${course.tutor.lastName}`
                          : course.tutorName || "Instructor"}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2">
                        {course.tutor?.bio ||
                          "Experienced instructor with a passion for teaching"}
                      </p>
                      <p className="text-sm text-gray-700">
                        Dedicated to helping students achieve their learning
                        goals through engaging and practical education.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Student Reviews
                  </h2>

                  {/* Rating Summary */}
                  <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Overall Rating */}
                      <div>
                        <div className="flex items-start gap-4">
                          <div>
                            <div className="text-5xl font-bold text-gray-900 mb-2">
                              {averageRating}
                            </div>
                            <div className="flex gap-1 mb-4">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={`text-2xl ${
                                    star <= Math.round(Number(averageRating))
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <p className="text-gray-600">
                              Based on {reviews.length} reviews
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Rating Distribution */}
                      <div className="space-y-3">
                        {ratingDistribution.map(({ star, count }) => (
                          <div key={star} className="flex items-center gap-3">
                            <span className="text-gray-600 font-medium min-w-fit">
                              {star} ★
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-sm">
                              <div
                                className="bg-yellow-400 h-2 rounded-full transition-all"
                                style={{
                                  width: `${
                                    reviews.length > 0
                                      ? (count / reviews.length) * 100
                                      : 0
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-gray-600 text-sm min-w-fit">
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-6">
                    {reviews && reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div
                          key={review.id}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  review.userImage ||
                                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.userName}`
                                }
                                alt={review.userName}
                                className="w-10 h-10 rounded-full"
                              />
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {review.userName}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {new Date(
                                    review.createdAt,
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                            <div>{renderStars(review.rating)}</div>
                          </div>

                          <h5 className="font-semibold text-gray-900 mb-2">
                            {review.title}
                          </h5>
                          <p className="text-gray-700 mb-4 leading-relaxed">
                            {review.comment}
                          </p>

                          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition">
                            <span>👍</span>
                            <span>Helpful ({review.helpful || 0})</span>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        No reviews yet. Be the first to review this course!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === "content" && (
              <div className="space-y-8">
                {/* Preview Section - Visible to everyone */}
                {previewMaterials.length > 0 && (
                  <div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-8 mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        🔓 Free Preview
                      </h2>
                      <p className="text-gray-700">
                        Watch these materials for free to get a feel for the
                        course
                      </p>
                    </div>
                    <div className="space-y-4">
                      {previewMaterials.map((content, index) => (
                        <div
                          key={content.id}
                          className="card flex items-center justify-between hover:bg-gray-50 transition"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center font-semibold text-green-700">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">
                                  {content.title}
                                </h3>
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                                  FREE
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="font-medium">
                                  {content.type === "video" ? "VIDEO" : "PDF"}
                                </span>
                                {content.duration && (
                                  <span className="flex items-center gap-1">
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    {content.duration} min
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              router.push(`/student/learn/${courseId}`)
                            }
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition flex-shrink-0 ml-4"
                          >
                            Watch Free
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enrolled Only Section */}
                {enrolledOnlyMaterials.length > 0 && (
                  <div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        📚 Course Materials
                      </h2>
                      {!isEnrolled && (
                        <p className="text-gray-700">
                          Enroll to access all {enrolledOnlyMaterials.length}{" "}
                          materials
                        </p>
                      )}
                    </div>
                    <div className="space-y-3">
                      {enrolledOnlyMaterials.map((content, index) => (
                        <div
                          key={content.id}
                          className={`bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-between ${
                            isEnrolled
                              ? "hover:shadow-md transition"
                              : "opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-gray-700 flex-shrink-0">
                              {previewMaterials.length + index + 1}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-2">
                                {content.title}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="font-medium">
                                  {content.type === "video" ? "VIDEO" : "PDF"}
                                </span>
                                {content.duration && (
                                  <span className="flex items-center gap-1">
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    {content.duration} min
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isEnrolled ? (
                            <button
                              onClick={() =>
                                router.push(`/student/learn/${courseId}`)
                              }
                              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition flex-shrink-0 ml-4"
                            >
                              Continue
                            </button>
                          ) : (
                            <span className="text-gray-400 font-medium flex-shrink-0 ml-4">
                              🔒 Locked
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Content Message */}
                {contents.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">
                      No course content available yet
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Course Card */}
          <div className="md:col-span-1">
            <div className="card sticky top-32">
              {course.thumbnail ? (
                <img
                  src={
                    course.thumbnail.startsWith("http")
                      ? course.thumbnail
                      : `${BACKEND_URL}${course.thumbnail}`
                  }
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg mb-6"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-lg mb-6 flex items-center justify-center text-white text-4xl font-bold">
                  {course.title.charAt(0)}
                </div>
              )}

              <div className="mb-6">
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  ${course.price}
                </div>
                <p className="text-sm text-gray-600">
                  30-day money-back guarantee
                </p>
              </div>

              {isEnrolled ? (
                <button
                  onClick={handleEnroll}
                  className="btn-primary w-full mb-4 flex items-center justify-center gap-2 hover:shadow-lg transition-all text-lg py-3"
                >
                  ▶ Continue Learning
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                  className="btn-primary w-full mb-4 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg transition-all text-lg py-3"
                >
                  {isEnrolling ? (
                    <>
                      <svg
                        className="w-5 h-5 animate-spin inline mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Enrolling...
                    </>
                  ) : (
                    <>Enroll Now</>
                  )}
                </button>
              )}

              <button className="w-full py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium mb-6 transition">
                🛒 Add to Wishlist
              </button>

              <div className="space-y-4 border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="text-xl">📥</span>
                  <div>
                    <p className="font-semibold">Full lifetime access</p>
                    <p className="text-xs text-gray-500">
                      Download and access offline
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="text-xl">🏆</span>
                  <div>
                    <p className="font-semibold">Certificate included</p>
                    <p className="text-xs text-gray-500">Show your expertise</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="text-xl">💬</span>
                  <div>
                    <p className="font-semibold">Q&A Support</p>
                    <p className="text-xs text-gray-500">
                      Ask questions anytime
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="text-xl">📱</span>
                  <div>
                    <p className="font-semibold">Mobile ready</p>
                    <p className="text-xs text-gray-500">Learn on the go</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
