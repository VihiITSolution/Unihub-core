"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { Course, CourseContent } from "@/types";

export default function LearnPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [currentContent, setCurrentContent] = useState<CourseContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourseContent();
  }, [courseId]);

  const loadCourseContent = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockCourse: Course = {
        id: courseId,
        title: "Web Development Bootcamp",
        description: "Complete guide to modern web development",
        thumbnail: "",
        price: 99.99,
        tutorId: "tutor1",
        tutorName: "John Doe",
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
          url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          duration: 30,
          order: 1,
        },
        {
          id: "2",
          courseId,
          title: "HTML Basics",
          type: "video",
          url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          duration: 45,
          order: 2,
        },
        {
          id: "3",
          courseId,
          title: "Course Resources",
          type: "pdf",
          url: "/sample.pdf",
          order: 3,
        },
        {
          id: "4",
          courseId,
          title: "CSS Fundamentals",
          type: "video",
          url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          duration: 60,
          order: 4,
        },
      ];

      setCourse(mockCourse);
      setContents(mockContents);
      setCurrentContent(mockContents[0]);
    } catch (error) {
      console.error("Failed to load course content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentSelect = (content: CourseContent) => {
    setCurrentContent(content);
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">Loading course content...</div>
      </div>
    );
  }

  if (!course || !currentContent) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">Course content not found</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Course Content List */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">{course.title}</h2>
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">Your Progress</div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600"
                style={{ width: "25%" }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 mt-1">25% Complete</div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold mb-4 text-gray-700">Course Content</h3>
          <div className="space-y-2">
            {contents.map((content, index) => (
              <button
                key={content.id}
                onClick={() => handleContentSelect(content)}
                className={`w-full text-left p-4 rounded-lg transition-colors ${
                  currentContent.id === content.id
                    ? "bg-primary-100 border-2 border-primary-500"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1">
                      {content.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{content.type === "video" ? "🎥" : "📄"}</span>
                      <span>{content.type.toUpperCase()}</span>
                      {content.duration && <span>• {content.duration} min</span>}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white p-6 border-b">
          <h1 className="text-2xl font-bold mb-2">{currentContent.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{currentContent.type === "video" ? "🎥 Video" : "📄 PDF"}</span>
            {currentContent.duration && (
              <span>⏱️ {currentContent.duration} minutes</span>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Video Player */}
          {currentContent.type === "video" && (
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              <div className="aspect-video">
                <iframe
                  src={currentContent.url}
                  className="w-full h-full"
                  allowFullScreen
                  title={currentContent.title}
                ></iframe>
              </div>
            </div>
          )}

          {/* PDF Viewer */}
          {currentContent.type === "pdf" && (
            <div className="bg-white rounded-lg border-2 border-gray-200 p-8 mb-6">
              <div className="text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold mb-2">PDF Document</h3>
                <p className="text-gray-600 mb-4">
                  View or download the course material
                </p>
                <button className="btn-primary">Download PDF</button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                const currentIndex = contents.findIndex(
                  (c) => c.id === currentContent.id
                );
                if (currentIndex > 0) {
                  setCurrentContent(contents[currentIndex - 1]);
                }
              }}
              disabled={contents[0].id === currentContent.id}
              className={`px-6 py-2 rounded-lg font-semibold ${
                contents[0].id === currentContent.id
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              ← Previous
            </button>

            <button className="btn-primary">Mark as Complete</button>

            <button
              onClick={() => {
                const currentIndex = contents.findIndex(
                  (c) => c.id === currentContent.id
                );
                if (currentIndex < contents.length - 1) {
                  setCurrentContent(contents[currentIndex + 1]);
                }
              }}
              disabled={
                contents[contents.length - 1].id === currentContent.id
              }
              className={`px-6 py-2 rounded-lg font-semibold ${
                contents[contents.length - 1].id === currentContent.id
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "btn-primary"
              }`}
            >
              Next →
            </button>
          </div>

          {/* Additional Content Section */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">About this lesson</h3>
            <p className="text-gray-600">
              This lesson covers important concepts that will help you understand
              the fundamentals of the topic. Take notes and practice along with
              the video to maximize your learning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
