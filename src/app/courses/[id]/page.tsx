"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL, BACKEND_URL } from "@/lib/constants";
import { StartConversationButton } from "@/components/chat";
import type { Course, CourseContent } from "@/types";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const courseId = params?.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

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
    // Check if course is upcoming
    if (course?.isUpcoming) {
      alert(
        `${course.title} is coming soon! We'll notify you when it's available.`,
      );
      return;
    }

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
                Successfully Enrolled!
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
      <div className="bg-gray-50">
        <div className="container-custom py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/courses"
              className="text-primary-600 hover:underline text-sm font-medium"
            >
              Courses
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-700 text-sm">
              {course.categoryObj?.name || course.category}
            </span>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 pb-8">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="md:col-span-2">
            {course.isUpcoming && (
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 mb-6 text-center">
                <h2 className="text-2xl font-bold text-orange-900 mb-2">
                  Coming Soon!
                </h2>
                <p className="text-orange-700 mb-4">
                  This course is currently under preparation and will be
                  available soon. Click "Notify Me" below to get notified as
                  soon as it launches.
                </p>
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {course.title}
            </h1>

            {course.shortDescription && (
              <p className="text-base text-gray-700 mb-4 italic">
                {course.shortDescription}
              </p>
            )}

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 text-sm">Average Rating:</span>
                <span className="font-semibold text-gray-900">-</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-sm">Active Students:</span>
                <span className="font-medium">10+</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-sm">Duration:</span>
                <span className="font-medium">
                  {Math.floor((course.duration || 0) / 60)} hours
                </span>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {course.tutor?.firstName
                  ? course.tutor.firstName.charAt(0)
                  : course.tutorName?.charAt(0) || "T"}
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-gray-900">
                  {course.tutor
                    ? `${course.tutor.firstName} ${course.tutor.lastName}`
                    : course.tutorName || "Instructor"}
                </h5>
                <p className="text-xs text-gray-500">Instructor</p>
              </div>
              {(course.tutor?.id || course.tutorId) && (
                <StartConversationButton
                  recipientId={Number(course.tutor?.id || course.tutorId)}
                  contextType="course"
                  contextId={Number(course.id)}
                  label="Message Tutor"
                />
              )}
            </div>
            {/* About Section */}
            {course.aboutCourse && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    About This Course
                  </h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {course.aboutCourse}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Course Card */}
          <div className="md:col-span-1">
            <div>
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
                    {course.price === 0 ||
                    parseFloat(String(course.price)) === 0
                      ? "FREE"
                      : `Rs. ${course.price}`}
                  </div>
                </div>

                {course.isUpcoming ? (
                  <button
                    onClick={handleEnroll}
                    className="btn-primary w-full flex items-center justify-center gap-2 hover:shadow-lg transition-all text-lg py-3 bg-orange-500 hover:bg-orange-600"
                  >
                    Notify Me
                  </button>
                ) : isEnrolled ? (
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
