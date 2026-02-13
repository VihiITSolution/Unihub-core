"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import reviewService, { Review } from "@/services/review.service";
import { API_BASE_URL, BACKEND_URL } from "@/lib/constants";
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
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null);
  const [completedContentIds, setCompletedContentIds] = useState<Set<string>>(
    new Set(),
  );
  const [courseProgress, setCourseProgress] = useState(0);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (courseId) {
      loadCourseContent();
      loadUserReview();
      loadEnrollmentData();
    }
  }, [courseId, isAuthenticated]);

  // Load completed content from localStorage
  useEffect(() => {
    if (courseId) {
      const storageKey = `course_${courseId}_completed`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const completedIds = JSON.parse(stored);
          setCompletedContentIds(new Set(completedIds));
        } catch (e) {
          console.error("Failed to parse completed content", e);
        }
      }
    }
  }, [courseId]);

  // Calculate progress when contents or completed items change
  useEffect(() => {
    if (contents.length > 0) {
      const completed = completedContentIds.size;
      const total = contents.length;
      const progress = Math.round((completed / total) * 100);
      setCourseProgress(progress);
    }
  }, [completedContentIds, contents]);

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

  const loadEnrollmentData = async () => {
    if (!courseId || !token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/enrollments/check/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.enrollment) {
          setEnrollmentId(result.data.enrollment.id);
          setCourseProgress(result.data.enrollment.progress || 0);
        }
      }
    } catch (error) {
      console.error("Failed to load enrollment data:", error);
    }
  };

  const handleMarkAsComplete = async () => {
    if (!currentContent || !enrollmentId || !courseId) return;

    setIsMarkingComplete(true);

    try {
      // Add to completed set
      const newCompleted = new Set(completedContentIds);
      newCompleted.add(currentContent.id);
      setCompletedContentIds(newCompleted);

      // Save to localStorage
      const storageKey = `course_${courseId}_completed`;
      localStorage.setItem(
        storageKey,
        JSON.stringify(Array.from(newCompleted)),
      );

      // Calculate new progress
      const completed = newCompleted.size;
      const total = contents.length;
      const progress = Math.round((completed / total) * 100);

      // Update progress on server
      const response = await fetch(
        `${API_BASE_URL}/enrollments/${enrollmentId}/progress`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            progress,
            status: progress === 100 ? "completed" : "in_progress",
          }),
        },
      );

      if (response.ok) {
        setCourseProgress(progress);

        // Show completion message
        if (progress === 100) {
          alert(
            "🎉 Congratulations! You've completed this course! Don't forget to leave a review.",
          );
        } else {
          // Auto-navigate to next content
          const currentIndex = contents.findIndex(
            (c) => c.id === currentContent.id,
          );
          if (currentIndex < contents.length - 1) {
            setCurrentContent(contents[currentIndex + 1]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to mark as complete:", error);
      alert("Failed to update progress. Please try again.");
    } finally {
      setIsMarkingComplete(false);
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
      const courseResponse = await fetch(`${API_BASE_URL}/courses/${courseId}`);

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
        const userRoles = user?.roles || [];
        const isAdmin = userRoles.includes("admin");

        if (!isCourseOwner && !isAdmin) {
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
        `${API_BASE_URL}/courses/${courseId}/content`,
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

  // Convert YouTube URL to privacy-enhanced embed format
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

    // Use youtube-nocookie.com for privacy-enhanced mode
    // Add parameters to hide related videos, info, and controls branding
    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;
    }

    return url;
  };

  // Check if URL is a YouTube URL
  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  // Check if URL is a Cloudinary URL
  const isCloudinaryUrl = (url: string) => {
    return url.includes("cloudinary.com");
  };

  const getPdfUrl = (url: string) => {
    if (!url) return "";

    // Cloudinary URLs - use directly
    if (url.startsWith("http")) {
      return url;
    }

    // Invalid local path - return null to indicate error
    if (url.includes("\\") || url.includes(":/") || url.includes("uploads")) {
      return "";
    }

    // Shouldn't reach here in production
    console.error("Non-Cloudinary PDF URL detected:", url);
    return "";
  };

  const isValidPdfUrl = (url: string) => {
    if (!url) return false;
    // Only Cloudinary URLs are valid
    return url.startsWith("http") && url.includes("cloudinary.com");
  };

  const handleDownloadPdf = async (url: string, title: string) => {
    const pdfUrl = getPdfUrl(url);

    if (!pdfUrl) {
      alert(
        "This PDF was uploaded with an old system and is no longer available. Please ask the instructor to re-upload it.",
      );
      return;
    }

    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download PDF. Please try again or contact support.");
    }
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
                className="h-full bg-primary-600 transition-all duration-500"
                style={{ width: `${courseProgress}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {courseProgress}% Complete ({completedContentIds.size} of{" "}
              {contents.length} lessons)
            </div>
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
                  className={`w-full text-left p-4 rounded-lg transition-colors relative ${
                    currentContent?.id === content.id
                      ? "bg-primary-100 border-2 border-primary-500"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                        completedContentIds.has(content.id)
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {completedContentIds.has(content.id) ? "✓" : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm mb-1">
                        {content.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{content.type === "video" ? "🎥" : "📄"}</span>
                        <span>{content.type?.toUpperCase() || "CONTENT"}</span>
                        {content.duration && (
                          <span>• {content.duration} min</span>
                        )}
                        {completedContentIds.has(content.id) && (
                          <span className="text-green-600 font-medium">
                            • Completed
                          </span>
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
                  {currentContent.type === "video"
                    ? "🎥 Video"
                    : currentContent.type === "pdf"
                      ? "📄 PDF"
                      : "📄 Content"}
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
                    <iframe
                      src={getEmbedUrl(currentContent.url)}
                      className="w-full h-full"
                      allowFullScreen
                      title={currentContent.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      frameBorder="0"
                      referrerPolicy="strict-origin-when-cross-origin"
                      loading="lazy"
                    ></iframe>
                  </div>
                </div>
              )}

              {/* PDF Viewer */}
              {currentContent.type === "pdf" && currentContent.url && (
                <div className="bg-white rounded-lg overflow-hidden mb-6">
                  {!isValidPdfUrl(currentContent.url) ? (
                    // Show error for invalid/old PDFs
                    <div className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-16 h-16 text-red-400 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          PDF Not Available
                        </h3>
                        <p className="text-gray-600 mb-4 max-w-md">
                          This PDF was uploaded with an older system and is no
                          longer accessible. Please contact your instructor to
                          have it re-uploaded.
                        </p>
                        <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded">
                          <strong>For Instructors:</strong> Please delete this
                          material and upload a new PDF.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">📄</span>
                          <div>
                            <h3 className="font-semibold">
                              {currentContent.title}
                            </h3>
                            <p className="text-sm text-gray-300">
                              PDF Document
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={getPdfUrl(currentContent.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-medium transition-colors"
                          >
                            Open in New Tab
                          </a>
                          <button
                            onClick={() =>
                              currentContent.url &&
                              handleDownloadPdf(
                                currentContent.url,
                                currentContent.title,
                              )
                            }
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
                          >
                            Download
                          </button>
                        </div>
                      </div>

                      {/* Embedded PDF Viewer */}
                      <div className="bg-gray-100" style={{ height: "700px" }}>
                        <object
                          data={getPdfUrl(currentContent.url)}
                          type="application/pdf"
                          className="w-full h-full"
                          title={currentContent.title}
                        >
                          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <svg
                              className="w-16 h-16 text-gray-400 mb-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                            <p className="text-gray-600 mb-4">
                              Your browser doesn't support inline PDF viewing.
                            </p>
                            <a
                              href={getPdfUrl(currentContent.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-medium transition-colors"
                            >
                              Open PDF in New Tab
                            </a>
                          </div>
                        </object>
                      </div>

                      <div className="bg-gray-50 p-4 text-center text-sm text-gray-600">
                        <p>
                          Having trouble viewing? Try{" "}
                          <a
                            href={getPdfUrl(currentContent.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:underline font-medium"
                          >
                            opening in a new tab
                          </a>{" "}
                          or{" "}
                          <button
                            onClick={() =>
                              currentContent.url &&
                              handleDownloadPdf(
                                currentContent.url,
                                currentContent.title,
                              )
                            }
                            className="text-primary-600 hover:underline font-medium"
                          >
                            downloading the file
                          </button>
                          .
                        </p>
                      </div>
                    </>
                  )}
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

                <button
                  onClick={handleMarkAsComplete}
                  disabled={
                    completedContentIds.has(currentContent.id) ||
                    isMarkingComplete
                  }
                  className={`px-8 py-2 rounded-lg font-semibold ${
                    completedContentIds.has(currentContent.id)
                      ? "bg-green-500 text-white cursor-default"
                      : isMarkingComplete
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-primary-600 hover:bg-primary-700 text-white"
                  }`}
                >
                  {completedContentIds.has(currentContent.id)
                    ? "✓ Completed"
                    : isMarkingComplete
                      ? "Saving..."
                      : "Mark as Complete"}
                </button>

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
                      : "bg-primary-600 hover:bg-primary-700 text-white"
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
