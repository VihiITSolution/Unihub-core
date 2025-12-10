"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Course, CourseContent } from "@/types";

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  useEffect(() => {
    loadCourseDetails();
  }, [courseId]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockCourse: Course = {
        id: courseId,
        title: "Web Development Bootcamp",
        description:
          "Complete guide to modern web development. Learn HTML, CSS, JavaScript, React, Node.js, and more. Build real-world projects and launch your career as a web developer.",
        thumbnail: "",
        price: 99.99,
        tutorId: "tutor1",
        tutorName: "John Doe",
        tutorAvatar: "",
        category: "Web Development",
        level: "beginner",
        duration: 1200,
        enrolledCount: 150,
        rating: 4.5,
        reviewCount: 45,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockContents: CourseContent[] = [
        {
          id: "1",
          courseId,
          title: "Introduction to Web Development",
          type: "video",
          url: "",
          duration: 30,
          order: 1,
        },
        {
          id: "2",
          courseId,
          title: "HTML Basics",
          type: "video",
          url: "",
          duration: 45,
          order: 2,
        },
        {
          id: "3",
          courseId,
          title: "Course Resources",
          type: "pdf",
          url: "",
          order: 3,
        },
      ];

      setCourse(mockCourse);
      setContents(mockContents);
    } catch (error) {
      console.error("Failed to load course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    setShowEnrollModal(true);
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">Loading course details...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">Course not found</div>
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
              <span className="font-semibold">{course.rating}</span>
              <span className="text-gray-600">({course.reviewCount} reviews)</span>
            </div>
            <div className="text-gray-600">
              {course.enrolledCount} students enrolled
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
              ⏱️ {Math.floor(course.duration / 60)} hours
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold">
              {course.tutorName.charAt(0)}
            </div>
            <div>
              <p className="text-sm text-gray-600">Instructor</p>
              <p className="font-semibold">{course.tutorName}</p>
            </div>
          </div>
        </div>

        {/* Enrollment Card */}
        <div className="card">
          <div className="w-full h-48 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-lg mb-4 flex items-center justify-center text-white text-4xl font-bold">
            {course.title.charAt(0)}
          </div>
          <div className="text-3xl font-bold text-primary-600 mb-4">
            ${course.price}
          </div>
          <button onClick={handleEnroll} className="btn-primary w-full mb-4">
            Enroll Now
          </button>
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
        <h2 className="text-3xl font-bold mb-6">Course Content</h2>
        <div className="space-y-4">
          {contents.map((content, index) => (
            <div key={content.id} className="card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{content.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{content.type === "video" ? "🎥" : "📄"}</span>
                    <span>{content.type.toUpperCase()}</span>
                    {content.duration && <span>• {content.duration} min</span>}
                  </div>
                </div>
              </div>
              <button className="text-primary-600 hover:underline">Preview</button>
            </div>
          ))}
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-8">
            <h2 className="text-2xl font-bold mb-4">Enroll in Course</h2>
            <p className="text-gray-600 mb-6">
              You&apos;re about to enroll in &quot;{course.title}&quot; for ${course.price}
            </p>
            <div className="space-y-4">
              <Link
                href="/auth/login"
                className="block btn-primary text-center w-full"
              >
                Login to Enroll
              </Link>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
