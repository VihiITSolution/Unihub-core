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
            if (enrollmentData.success && Array.isArray(enrollmentData.data)) {
              const enrolled = enrollmentData.data.some(
                (enrollment: any) => enrollment.courseId === parseInt(courseId),
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

  const handleEnroll = () => {
    // Check if user is logged in
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Skip payment for now - go directly to player
    router.push(`/student/learn/${courseId}`);
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
            <div className="text-center">
              <p className="text-green-600 font-semibold mb-4">
                ✓ You're enrolled
              </p>
              <Link
                href={`/student/learn/${courseId}`}
                className="btn-primary w-full mb-4"
              >
                Continue Learning
              </Link>
            </div>
          ) : (
            <button onClick={handleEnroll} className="btn-primary w-full mb-4">
              Enroll Now
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
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-2">🔓 Free Preview</h2>
              <p className="text-gray-600">
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
                        <h3 className="font-semibold">{content.title}</h3>
                        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                          FREE PREVIEW
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{content.type === "video" ? "🎥" : "📄"}</span>
                        <span>{content.type.toUpperCase()}</span>
                        {content.duration && (
                          <span>• {content.duration} min</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="text-green-600 hover:text-green-700 hover:underline font-semibold">
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-2">📚 Course Content</h2>
              {!isEnrolled && (
                <p className="text-gray-600">
                  Enroll to access all {enrolledOnlyMaterials.length} materials
                </p>
              )}
            </div>
            <div className="space-y-4">
              {enrolledOnlyMaterials.map((content, index) => (
                <div
                  key={content.id}
                  className={`card flex items-center justify-between ${
                    isEnrolled ? "hover:bg-gray-50 transition" : "opacity-75"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center font-semibold text-blue-700">
                      {previewMaterials.length + index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{content.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{content.type === "video" ? "🎥" : "📄"}</span>
                        <span>{content.type.toUpperCase()}</span>
                        {content.duration && (
                          <span>• {content.duration} min</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isEnrolled ? (
                    <button className="text-primary-600 hover:underline font-semibold">
                      Continue
                    </button>
                  ) : (
                    <span className="text-gray-400 font-semibold">
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
            <p className="text-gray-600">No course content available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
