"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL, BACKEND_URL } from "@/lib/constants";
import { courseService } from "@/services/course.service";
import type { Course, CourseContent } from "@/types";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const courseId = params?.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      loadCourseDetails();
    }
  }, [courseId]);

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
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const courseResponse = await fetch(
        `${API_BASE_URL}/courses/${courseId}`,
        { headers }
      );

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
        `${API_BASE_URL}/courses/${courseId}/content`
      );

      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        if (contentData.success && contentData.data) {
          setContents(contentData.data.contents || []);
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
    if (!isAuthenticated || !token) {
      router.push("/auth/login?redirect=/courses/" + courseId);
      return;
    }

    try {
      setEnrollmentError(null);
      // Call enrollment API
      const response = await courseService.enrollInCourse(courseId, token);

      if (response.success) {
        // Redirect to learning player on success
        router.push(`/student/learn/${courseId}`);
      } else {
        setEnrollmentError(response.message || "Enrollment failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Enrollment error:", err);
      setEnrollmentError(err.message || "Failed to enroll. Please try again later.");
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
          {enrollmentError && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
              {enrollmentError}
            </div>
          )}
          {course.isEnrolled ? (
            <button disabled className="btn-primary w-full mb-4 opacity-50 cursor-not-allowed">
              Already Enrolled
            </button>
          ) : (
            <button onClick={handleEnroll} className="btn-primary w-full mb-4">
              {isAuthenticated ? "Enroll Now" : "Login to Enroll"}
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

      {/* Payment Modal */}
      {course && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handlePaymentSubmit}
          course={{
            title: course.title,
            price: course.price,
          }}
          isProcessing={isEnrolling}
        />
      )}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Course Content</h2>
        <div className="space-y-4">
          {contents.map((content, index) => (
            <div
              key={content.id}
              className="card flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{content.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      {content.type === "video" ? "🎥" : "📄"}
                    </span>
                    <span>{content.type.toUpperCase()}</span>
                    {content.duration && <span>• {content.duration} min</span>}
                  </div>
                </div>
              </div>
              <button className="text-primary-600 hover:underline">
                Preview
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
