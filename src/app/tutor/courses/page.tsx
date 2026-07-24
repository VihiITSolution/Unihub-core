"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { BACKEND_URL } from "@/lib/constants";
import { courseService } from "@/services/course.service";
import reviewService, { Review } from "@/services/review.service";
import { Avatar } from "@/components/ui";
import type { Course } from "@/types";

export default function TutorCoursesPage() {
  const router = useRouter();
  const { token, isAuthenticated, hasRole } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourseReviews, setSelectedCourseReviews] = useState<{
    [key: string]: Review[];
  }>({});
  const [showReviews, setShowReviews] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!hasRole("tutor")) {
      router.push("/");
      return;
    }

    loadTutorCourses();
  }, [isAuthenticated, hasRole, router]);

  const loadTutorCourses = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const response = await courseService.getTutorCourses(token);

      if (response.success && response.data) {
        // Handle if response.data is an object with courses array or directly an array
        const coursesData = Array.isArray(response.data)
          ? response.data
          : (response.data as any).courses || [];
        setCourses(coursesData);
      } else {
        setError("Failed to load courses");
        setCourses([]);
      }
    } catch (error) {
      console.error("Failed to load courses:", error);
      setError("Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseReviews = async (courseId: string) => {
    try {
      const result = await reviewService.getCourseReviews(parseInt(courseId));
      if (result.success && result.data) {
        setSelectedCourseReviews((prev) => ({
          ...prev,
          [courseId]: result.data!.reviews,
        }));
      }
    } catch (error) {
      console.error("Failed to load course reviews:", error);
    }
  };

  const toggleReviews = async (courseId: string) => {
    const isCurrentlyShown = showReviews[courseId];

    if (!isCurrentlyShown && !selectedCourseReviews[courseId]) {
      await loadCourseReviews(courseId);
    }

    setShowReviews((prev) => ({
      ...prev,
      [courseId]: !isCurrentlyShown,
    }));
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!token) return;

    if (
      !confirm(
        `Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const response = await courseService.deleteCourse(courseId, token);

      if (response.success) {
        // Remove course from state
        setCourses(courses.filter((c) => c.id !== courseId));
        alert("Course deleted successfully");
      } else {
        alert("Failed to delete course");
      }
    } catch (error) {
      console.error("Failed to delete course:", error);
      alert("Failed to delete course");
    }
  };

  const handleSubmitForReview = async (courseId: string) => {
    if (!token) return;

    setSubmittingId(courseId);
    try {
      const response = await courseService.submitForReview(courseId, token);

      if (response.success && response.data) {
        setCourses((prev) =>
          prev.map((c) => (c.id === courseId ? { ...c, ...response.data } : c)),
        );
      } else {
        alert(response.message || "Failed to submit course for review");
      }
    } catch (error) {
      console.error("Failed to submit course for review:", error);
      alert("Failed to submit course for review");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Courses</h1>
          <p className="text-gray-600">
            Manage your courses and view student feedback
          </p>
        </div>
        <Link href="/tutor/create-course" className="btn-primary">
          + Create New Course
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600">
          {error}
        </div>
      )}

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
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                {course.thumbnail ? (
                  <img
                    src={
                      course.thumbnail.startsWith("http")
                        ? course.thumbnail
                        : `${BACKEND_URL}${course.thumbnail}`
                    }
                    alt={course.title}
                    className="w-full sm:w-56 h-48 sm:h-36 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-full sm:w-56 h-48 sm:h-36 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                    {course.title.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {course.title}
                        </h3>
                        {/* Approval Status Badge */}
                        {course.approvalStatus === "approved" && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            ✓ Approved
                          </span>
                        )}
                        {course.approvalStatus === "pending" && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                            ⏳ Pending Review
                          </span>
                        )}
                        {course.approvalStatus === "rejected" && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                            ✗ Rejected
                          </span>
                        )}
                        {course.approvalStatus === "draft" && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                            📝 Draft
                          </span>
                        )}
                      </div>
                      {/* Rejection Reason */}
                      {course.approvalStatus === "rejected" &&
                        course.rejectionReason && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">
                              <strong>Rejection Reason:</strong>{" "}
                              {course.rejectionReason}
                            </p>
                          </div>
                        )}
                      {/* Submit for Review */}
                      {(course.approvalStatus === "draft" ||
                        course.approvalStatus === "rejected") && (
                        <button
                          onClick={() => handleSubmitForReview(course.id)}
                          disabled={submittingId === course.id}
                          className="mt-2 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {submittingId === course.id
                            ? "Submitting…"
                            : "Submit for Review"}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Link
                        href={`/tutor/edit-course/${course.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit course"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Link>
                      <Link
                        href={`/courses/${course.id}`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View course"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </Link>
                      <Link
                        href={`/student/learn/${course.id}`}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Watch course"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </Link>
                      <button
                        onClick={() =>
                          handleDeleteCourse(course.id, course.title)
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete course"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <span>{course.enrollmentCount || 0} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>
                        {course.rating || 0} ({course.reviewCount || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-blue-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Rs. {course.price}</span>
                    </div>
                    <button
                      onClick={() => toggleReviews(course.id)}
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                      <span>
                        {showReviews[course.id]
                          ? "Hide Reviews"
                          : `View Reviews (${course.reviewCount || 0})`}
                      </span>
                    </button>
                  </div>

                  {/* Reviews Section */}
                  {showReviews[course.id] && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold mb-3">Student Reviews</h4>
                      {selectedCourseReviews[course.id]?.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {selectedCourseReviews[course.id].map((review) => (
                            <div
                              key={review.id}
                              className="p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Avatar
                                    src={review.user?.profileImage}
                                    firstName={review.user?.firstName}
                                    lastName={review.user?.lastName}
                                    size={32}
                                  />
                                  <div>
                                    <p className="font-medium text-sm">
                                      {review.user?.firstName}{" "}
                                      {review.user?.lastName}
                                    </p>
                                    <div className="flex gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                          key={star}
                                          className={`text-sm ${
                                            star <= review.rating
                                              ? "text-yellow-400"
                                              : "text-gray-300"
                                          }`}
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(
                                    review.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              {review.comment && (
                                <p className="text-sm text-gray-700 mt-2">
                                  {review.comment}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No reviews yet</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
