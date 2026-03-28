"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL, BACKEND_URL } from "@/lib/constants";
import type { Course, CourseContent } from "@/types";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const courseId = params?.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "reviews">("about");

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

      // Fetch reviews from API
      try {
        const reviewsResponse = await fetch(
          `${API_BASE_URL}/reviews/course/${courseId}?limit=10`,
        );

        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          if (reviewsData.success && Array.isArray(reviewsData.data)) {
            setReviews(reviewsData.data);
          } else if (reviewsData.data?.reviews) {
            setReviews(reviewsData.data.reviews);
          }
        }
      } catch (reviewError) {
        console.error("Failed to load reviews:", reviewError);
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
          <div className="flex flex-wrap gap-6 items-center mb-6">
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

          {/* Instructor */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {course.tutor?.firstName
                ? course.tutor.firstName.charAt(0)
                : course.tutorName?.charAt(0) || "T"}
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-900">
                {course.tutor
                  ? `${course.tutor.firstName} ${course.tutor.lastName}`
                  : course.tutorName || "Instructor"}
              </h5>
              <p className="text-xs text-gray-500">Instructor</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Tab Navigation */}
            <div className="flex gap-8 border-b border-gray-200 mb-8">
              {["about", "reviews"].map((tab) => (
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
                                  review.user?.profilePhoto ||
                                  review.userImage ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    review.userName || "User",
                                  )}&background=random`
                                }
                                alt={review.userName || "Reviewer"}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {review.user?.firstName &&
                                  review.user?.lastName
                                    ? `${review.user.firstName} ${review.user.lastName}`
                                    : review.userName || "Anonymous"}
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

                          {review.title && (
                            <h5 className="font-semibold text-gray-900 mb-2">
                              {review.title}
                            </h5>
                          )}
                          {review.comment && (
                            <p className="text-gray-700 mb-4 leading-relaxed">
                              {review.comment}
                            </p>
                          )}
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
          </div>

          {/* Sidebar - Course Card */}
          <div className="md:col-span-1">
            <div className="sticky top-32">
              {course.thumbnail ? (
                <img
                  src={
                    course.thumbnail.startsWith("http")
                      ? course.thumbnail
                      : `${BACKEND_URL}${course.thumbnail}`
                  }
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-lg mb-4 flex items-center justify-center text-white text-4xl font-bold">
                  {course.title.charAt(0)}
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="mb-4">
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
                    className="btn-primary w-full flex items-center justify-center gap-2 hover:shadow-lg transition-all text-lg py-3"
                  >
                    ▶ Continue Learning
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="btn-primary w-full disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg transition-all text-lg py-3"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
