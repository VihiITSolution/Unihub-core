"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
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
  const [completedContents, setCompletedContents] = useState<
    Set<string | number>
  >(new Set());
  const [enrollment, setEnrollment] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userReview, setUserReview] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (courseId) {
      loadCourseContent();
      loadReviews();
    }
  }, [courseId, isAuthenticated]);

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
      // Fetch user's enrollment for this course
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
              const userEnrollment = enrollmentData.data.find(
                (e: any) => e.courseId === parseInt(courseId),
              );
              if (userEnrollment) {
                setEnrollment(userEnrollment);
                // Load completed contents if available
                const completed = userEnrollment.completedContents || [];
                setCompletedContents(
                  new Set(completed.map((id: any) => String(id))),
                );
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch enrollment:", err);
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

  const handleMarkAsComplete = async () => {
    if (!currentContent || !enrollment) return;

    try {
      // Mark as complete via API
      const completedArray = [
        ...Array.from(completedContents),
        String(currentContent.id),
      ];

      const response = await fetch(
        `${API_BASE_URL}/enrollments/${enrollment.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            completedContents: completedArray,
            progress: Math.round(
              (completedArray.length / contents.length) * 100,
            ),
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to mark as complete:", errorData);
        alert(
          errorData.message ||
            "Failed to mark content as complete. Please try again.",
        );
        return;
      }

      // Update local state
      const newCompleted = new Set(completedContents);
      newCompleted.add(String(currentContent.id));
      setCompletedContents(newCompleted);

      // Auto-navigate to next content
      const currentIndex = contents.findIndex(
        (c) => c.id === currentContent.id,
      );
      if (currentIndex < contents.length - 1) {
        setCurrentContent(contents[currentIndex + 1]);
      } else {
        // If last content, show completion message
        alert("Congratulations! You've completed the course!");
      }
    } catch (error) {
      console.error("Error marking as complete:", error);
      alert("An error occurred while marking content as complete.");
    }
  };

  const loadReviews = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reviews/course/${courseId}?limit=10`,
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setReviews(data.data);
          // Find user's review
          const myReview = data.data.find((r: any) => r.userId === user?.id);
          if (myReview) {
            setUserReview(myReview);
            setReviewRating(myReview.rating);
            setReviewComment(myReview.comment || "");
          }
        } else if (data.data?.reviews) {
          setReviews(data.data.reviews);
          const myReview = data.data.reviews.find(
            (r: any) => r.userId === user?.id,
          );
          if (myReview) {
            setUserReview(myReview);
            setReviewRating(myReview.rating);
            setReviewComment(myReview.comment || "");
          }
        }
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (reviewRating < 1 || reviewRating > 5) {
      alert("Please select a rating between 1 and 5");
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: parseInt(courseId),
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      if (!response.ok) {
        alert("Failed to submit review");
        return;
      }

      // Reload reviews
      await loadReviews();
      setReviewComment("");
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Convert YouTube URL/ID to privacy-enhanced embed format.
  const getEmbedUrl = (url?: string, youtubeVideoId?: string) => {
    let videoId = youtubeVideoId || "";

    if (!videoId && url) {
      if (url.includes("youtube.com/watch?v=")) {
        videoId = url.split("v=")[1]?.split("&")[0] || "";
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
      } else if (url.includes("youtube.com/v/")) {
        videoId = url.split("/v/")[1]?.split("?")[0] || "";
      } else if (
        url.includes("youtube.com/embed/") ||
        url.includes("youtube-nocookie.com/embed/")
      ) {
        videoId = url.split("/embed/")[1]?.split("?")[0] || "";
      }
    }

    if (!videoId) return url || "";

    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&cc_load_policy=0`;
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
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden p-4 bg-white border-b border-gray-200 flex items-center justify-between"
      >
        <span className="font-semibold text-gray-700">Course Content</span>
        <svg
          className={`w-6 h-6 transform transition-transform ${sidebarOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Sidebar - Course Content List */}
      <div
        className={`${
          sidebarOpen ? "block" : "hidden"
        } md:block md:w-80 bg-white shadow-lg overflow-y-auto fixed md:relative left-0 top-0 w-full h-full md:h-auto md:shadow-lg z-40`}
      >
        <div className="p-6 border-b md:block hidden">
          <h2 className="text-xl font-bold">{course.title}</h2>
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">Your Progress</div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600"
                style={{
                  width: `${
                    contents.length > 0
                      ? (completedContents.size / contents.length) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {completedContents.size} of {contents.length} completed
            </div>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="p-4 border-b md:hidden bg-white">
          <h3 className="font-semibold mb-3 text-gray-700">{course.title}</h3>
          <div className="text-sm text-gray-600 mb-2">Progress</div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600"
              style={{
                width: `${
                  contents.length > 0
                    ? (completedContents.size / contents.length) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {completedContents.size} of {contents.length} completed
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold mb-4 text-gray-700">Course Materials</h3>
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
                  onClick={() => {
                    handleContentSelect(content);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${
                    currentContent?.id === content.id
                      ? "bg-primary-100 border-2 border-primary-500"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {completedContents.has(String(content.id)) ? (
                        <span className="bg-green-500 text-white rounded-full w-full h-full flex items-center justify-center">
                          ✓
                        </span>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-1 truncate">
                        {content.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
                        <span>{content.type === "video" ? "🎥" : "📄"}</span>
                        <span>{content.type.toUpperCase()}</span>
                        {content.duration && (
                          <span>• {content.duration} min</span>
                        )}
                        {completedContents.has(String(content.id)) && (
                          <span className="text-green-600 font-semibold">
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

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto flex flex-col w-full">
        {currentContent ? (
          <>
            <div className="bg-white p-4 md:p-6 border-b sticky top-0 z-10">
              <h1 className="text-xl md:text-2xl font-bold mb-2">
                {currentContent.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                <span>
                  {currentContent.type === "video" ? "🎥 Video" : "📄 PDF"}
                </span>
                {currentContent.duration && (
                  <span>⏱️ {currentContent.duration} minutes</span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Video Player */}
              {currentContent.type === "video" && currentContent.url && (
                <div className="bg-black rounded-lg overflow-hidden mb-6">
                  <div className="aspect-video w-full">
                    <iframe
                      src={getEmbedUrl(
                        currentContent.url,
                        currentContent.youtubeVideoId,
                      )}
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
                <div className="bg-white rounded-lg border-2 border-gray-200 p-6 md:p-8 mb-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-lg md:text-xl font-semibold mb-2">
                      PDF Document
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 mb-4">
                      View or download the course material
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                      <a
                        href={
                          currentContent.url.startsWith("http")
                            ? currentContent.url
                            : `${BACKEND_URL}${currentContent.url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-center"
                      >
                        View PDF
                      </a>
                      <a
                        href={
                          currentContent.url.startsWith("http")
                            ? currentContent.url
                            : `${BACKEND_URL}${currentContent.url}`
                        }
                        download
                        className="px-6 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-semibold text-center"
                      >
                        Download PDF
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-center mt-8">
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
                  className={`w-full sm:w-auto px-6 py-2 rounded-lg font-semibold ${
                    contents[0].id === currentContent.id
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  ← Previous
                </button>

                <button
                  onClick={handleMarkAsComplete}
                  disabled={completedContents.has(String(currentContent.id))}
                  className={`w-full sm:w-auto px-6 py-2 rounded-lg font-semibold ${
                    completedContents.has(String(currentContent.id))
                      ? "bg-green-200 text-green-600 cursor-not-allowed"
                      : "btn-primary"
                  }`}
                >
                  {completedContents.has(String(currentContent.id))
                    ? "✓ Completed"
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
                  className={`w-full sm:w-auto px-6 py-2 rounded-lg font-semibold ${
                    contents[contents.length - 1].id === currentContent.id
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "btn-primary"
                  }`}
                >
                  Next →
                </button>
              </div>

              {/* Additional Content Section */}
              <div className="mt-8 p-4 md:p-6 bg-gray-50 rounded-lg">
                <h3 className="text-base md:text-lg font-semibold mb-4">
                  About this lesson
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  This lesson covers important concepts that will help you
                  understand the fundamentals of the topic. Take notes and
                  practice along with the video to maximize your learning.
                </p>
              </div>

              {/* Course Reviews Section */}
              <div className="mt-8 p-4 md:p-6 bg-white border border-gray-200 rounded-lg">
                <h3 className="text-base md:text-lg font-semibold mb-6">
                  Course Reviews
                </h3>

                {/* User's Review Form */}
                {isAuthenticated && (
                  <div className="mb-8 pb-8 border-b">
                    <h4 className="font-semibold mb-4 text-sm md:text-base">
                      {userReview ? "Edit Your Review" : "Leave a Review"}
                    </h4>
                    <div className="space-y-4">
                      {/* Rating Stars */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Rating
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setReviewRating(star)}
                              className={`text-2xl md:text-3xl transition ${
                                star <= reviewRating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Comment
                        </label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your thoughts about this course..."
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        />
                      </div>

                      <button
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        className="w-full sm:w-auto px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 font-semibold text-sm"
                      >
                        {submittingReview
                          ? "Submitting..."
                          : userReview
                            ? "Update Review"
                            : "Submit Review"}
                      </button>
                    </div>
                  </div>
                )}

                {/* All Reviews */}
                <div>
                  <h4 className="font-semibold mb-4 text-sm md:text-base">
                    Reviews ({reviews.length})
                  </h4>
                  {reviews.length === 0 ? (
                    <p className="text-gray-500 text-xs md:text-sm">
                      No reviews yet. Be the first to review this course!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review: any, idx: number) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                            <div>
                              <p className="font-semibold text-sm md:text-base">
                                {review.user?.firstName} {review.user?.lastName}
                              </p>
                              <p className="text-xs md:text-sm text-gray-500">
                                {new Date(
                                  review.createdAt,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={
                                    star <= review.rating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 text-sm">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <svg
                className="w-16 md:w-24 h-16 md:h-24 mx-auto mb-4 text-gray-300"
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
              <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
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
