"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import reviewService, { Review } from "@/services/review.service";
import type { Course, CourseContent } from "@/types";

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const courseId = params?.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<CourseContent[]>([]);
  const [currentContent, setCurrentContent] = useState<CourseContent | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (courseId) {
      loadCourseContent();
      loadUserReview();
    }
  }, [courseId, isAuthenticated]);

  const loadUserReview = async () => {
    if (!courseId) return;

    try {
      const result = await reviewService.getUserReview(parseInt(courseId));
      if (result.success && result.data?.review) {
        setUserReview(result.data.review);
        setRating(result.data.review.rating);
        setComment(result.data.review.comment || "");
      }
    } catch (error) {
      console.error("Failed to load user review:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!courseId || rating === 0) return;

    try {
      setSubmittingReview(true);
      const result = await reviewService.addReview({
        courseId: parseInt(courseId),
        rating,
        comment,
      });

      if (result.success) {
        alert("Review submitted successfully!");
        setShowRatingModal(false);
        loadUserReview(); // Reload to get updated review
      } else {
        alert(result.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const loadCourseContent = async () => {
    if (!courseId) {
      setError("Course ID is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch real course data
      const courseResponse = await fetch(
        `http://localhost:5000/api/courses/${courseId}`,
      );

      if (!courseResponse.ok) {
        throw new Error(`Failed to fetch course: ${courseResponse.status}`);
      }

      const courseData = await courseResponse.json();

      if (courseData.success && courseData.data) {
        const courseInfo = courseData.data.course;
        setCourse(courseInfo);

        // Check if user is the course owner (tutor who created it)
        const isCourseOwner = user?.id === courseInfo.tutorId;

        // For now, allow access if user is course owner
        // Later you can add enrollment check here
        if (!isCourseOwner && user?.role !== "admin") {
          // TODO: Add enrollment check
          // const isEnrolled = await checkEnrollment(courseId, user.id);
          // if (!isEnrolled) {
          //   setError("You must enroll in this course to access it");
          //   setLoading(false);
          //   return;
          // }
        }
      } else {
        setError(courseData.message || "Failed to load course");
      }

      // Fetch course content
      const contentResponse = await fetch(
        `http://localhost:5000/api/courses/${courseId}/content`,
      );

      if (contentResponse.ok) {
        const contentData = await contentResponse.json();
        if (contentData.success && contentData.data) {
          const contents = contentData.data.contents || [];
          setContents(contents);
          if (contents.length > 0) {
            setCurrentContent(contents[0]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load course content:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load course",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContentSelect = (content: CourseContent) => {
    setCurrentContent(content);
  };

  // Convert YouTube URL to embed format
  const getEmbedUrl = (url: string) => {
    if (!url) return "";

    // If it's already an embed URL, return it
    if (url.includes("/embed/")) return url;

    // Extract video ID from various YouTube URL formats
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/v/")) {
      videoId = url.split("/v/")[1]?.split("?")[0];
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  // Check if URL is a YouTube URL
  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  // Check if URL is a Cloudinary URL
  const isCloudinaryUrl = (url: string) => {
    return url.includes("cloudinary.com");
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">Loading course content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <a href="/student/dashboard" className="btn-primary">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <div className="mb-4">Course not found</div>
          <a href="/courses" className="btn-primary">
            Back to Courses
          </a>
        </div>
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
            {contents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No materials available yet.</p>
                <p className="text-sm mt-2">
                  The instructor hasn't added any content to this course.
                </p>
              </div>
            ) : (
              contents.map((content, index) => (
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
                        {content.duration && (
                          <span>• {content.duration} min</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {currentContent ? (
          <>
            <div className="bg-white p-6 border-b">
              <h1 className="text-2xl font-bold mb-2">
                {currentContent.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  {currentContent.type === "video" ? "🎥 Video" : "📄 PDF"}
                </span>
                {currentContent.duration && (
                  <span>⏱️ {currentContent.duration} minutes</span>
                )}
              </div>
            </div>

            <div className="p-6">
              {/* Video Player */}
              {currentContent.type === "video" && currentContent.url && (
                <div className="bg-black rounded-lg overflow-hidden mb-6">
                  <div className="aspect-video">
                    {isYouTubeUrl(currentContent.url) ? (
                      // YouTube iframe embed
                      <iframe
                        src={getEmbedUrl(currentContent.url)}
                        className="w-full h-full"
                        allowFullScreen
                        title={currentContent.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      ></iframe>
                    ) : (
                      // HTML5 video player for Cloudinary or other video URLs
                      <video
                        className="w-full h-full"
                        controls
                        controlsList="nodownload"
                        preload="metadata"
                      >
                        <source src={currentContent.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </div>
              )}

              {/* PDF Viewer */}
              {currentContent.type === "pdf" && currentContent.url && (
                <div className="bg-white rounded-lg border-2 border-gray-200 p-8 mb-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold mb-2">PDF Document</h3>
                    <p className="text-gray-600 mb-4">
                      View or download the course material
                    </p>
                    <div className="flex gap-4 justify-center">
                      <a
                        href={
                          currentContent.url.startsWith("http")
                            ? currentContent.url
                            : `http://localhost:5000${currentContent.url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                      >
                        View PDF
                      </a>
                      <a
                        href={
                          currentContent.url.startsWith("http")
                            ? currentContent.url
                            : `http://localhost:5000${currentContent.url}`
                        }
                        download
                        className="px-6 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-semibold"
                      >
                        Download PDF
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    const currentIndex = contents.findIndex(
                      (c) => c.id === currentContent.id,
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
                      (c) => c.id === currentContent.id,
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
                <h3 className="text-lg font-semibold mb-4">
                  About this lesson
                </h3>
                <p className="text-gray-600">
                  This lesson covers important concepts that will help you
                  understand the fundamentals of the topic. Take notes and
                  practice along with the video to maximize your learning.
                </p>
              </div>

              {/* Rating Section */}
              <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Rate this Course</h3>
                {userReview ? (
                  <div>
                    <p className="text-gray-600 mb-4">
                      You rated this course {userReview.rating} out of 5 stars
                    </p>
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-2xl ${
                            star <= userReview.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    {userReview.comment && (
                      <p className="text-gray-700 mb-4 italic">
                        "{userReview.comment}"
                      </p>
                    )}
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="btn-secondary"
                    >
                      Update Review
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-4">
                      Share your experience with this course
                    </p>
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="btn-primary"
                    >
                      Write a Review
                    </button>
                  </div>
                )}
              </div>

              {/* Rating Modal */}
              {showRatingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                    <h3 className="text-2xl font-bold mb-4">
                      Rate this Course
                    </h3>

                    {/* Star Rating */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-4xl transition-colors ${
                              star <= rating
                                ? "text-yellow-400 hover:text-yellow-500"
                                : "text-gray-300 hover:text-gray-400"
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review (Optional)
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Share your thoughts about this course..."
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setShowRatingModal(false);
                          if (userReview) {
                            setRating(userReview.rating);
                            setComment(userReview.comment || "");
                          }
                        }}
                        className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={submittingReview}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitReview}
                        disabled={rating === 0 || submittingReview}
                        className={`flex-1 px-6 py-2 rounded-lg text-white font-semibold ${
                          rating === 0 || submittingReview
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-primary-600 hover:bg-primary-700"
                        }`}
                      >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <svg
                className="w-24 h-24 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Content Available
              </h3>
              <p className="text-gray-500">
                This course doesn't have any materials yet. Check back later!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
