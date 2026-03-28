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

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">Loading course details...</div>
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
    <div className="container-custom py-8">
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

      {/* Course Header */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-xl text-gray-600 mb-6">{course.description}</p>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⭐</span>
              <span className="font-semibold">{course.rating || 0}</span>
              <span className="text-gray-600">
                ({course.reviewCount || 0} reviews)
              </span>
            </div>
            <div className="text-gray-600">
              {course.enrolledCount || course.enrollmentCount || 0} students
              enrolled
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full">
              {course.level}
            </span>
            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full">
              {course.category}
            </span>
            <span className="text-gray-600">
              ⏱️ {Math.floor((course.duration || 0) / 60)} hours
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold">
              {course.tutor?.firstName
                ? course.tutor.firstName.charAt(0)
                : course.tutorName?.charAt(0) || "T"}
            </div>
            <div>
              <p className="text-sm text-gray-600">Instructor</p>
              <p className="font-semibold">
                {course.tutor
                  ? `${course.tutor.firstName} ${course.tutor.lastName}`
                  : course.tutorName || "Instructor"}
              </p>
            </div>
          </div>
        </div>

        {/* Enrollment Card */}
        <div className="card">
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
          <div className="text-3xl font-bold text-primary-600 mb-4">
            ${course.price}
          </div>
          {isEnrolled ? (
            <button
              onClick={handleEnroll}
              className="btn-primary w-full mb-4 flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              ▶ Continue Learning
            </button>
          ) : (
            <button
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="btn-primary w-full mb-4 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              {isEnrolling ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
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
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Full lifetime access</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Certificate of completion</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>30-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="mb-12">
        {/* Preview Section - Visible to everyone */}
        {previewMaterials.length > 0 && (
          <div className="mb-12">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Free Preview
              </h2>
              <p className="text-gray-700">
                Watch these materials for free to get a feel for the course
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
                    onClick={() => router.push(`/student/learn/${courseId}`)}
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
                Course Materials
              </h2>
              {!isEnrolled && (
                <p className="text-gray-700">
                  Enroll to access all {enrolledOnlyMaterials.length} materials
                </p>
              )}
            </div>
            <div className="space-y-3">
              {enrolledOnlyMaterials.map((content, index) => (
                <div
                  key={content.id}
                  className={`bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-between ${
                    isEnrolled ? "hover:shadow-md transition" : "opacity-60"
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
                      onClick={() => router.push(`/student/learn/${courseId}`)}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition flex-shrink-0 ml-4"
                    >
                      Continue
                    </button>
                  ) : (
                    <span className="text-gray-400 font-medium flex-shrink-0 ml-4">
                      Locked
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
            <p className="text-gray-600">No course content available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
