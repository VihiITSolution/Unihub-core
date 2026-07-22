"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL, BACKEND_URL } from "@/lib/constants";
import { courseService } from "@/services/course.service";
import { FALLBACK_FACULTIES, type Faculty, type Department } from "@/services/faculty.service";

interface CourseMaterial {
  id: string;
  title: string;
  type: "video" | "pdf";
  url?: string;
  file?: File;
  duration?: number;
  order?: number;
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const { token, isAuthenticated, hasRole } = useAuth();
  const courseId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "materials">(
    "details",
  );
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [currentThumbnail, setCurrentThumbnail] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    aboutCourse: "",
    level: "beginner",
    duration: "",
    facultyId: "",
    departmentId: "",
    year: "",
  });

  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState({
    title: "",
    type: "video" as "video" | "pdf",
    file: null as File | null,
    duration: "",
    order: "",
  });
  const MAX_VIDEO_UPLOAD_MB = Number(
    process.env.NEXT_PUBLIC_MAX_VIDEO_UPLOAD_MB || 5000,
  );

  const [faculties, setFaculties] = useState<Faculty[]>(FALLBACK_FACULTIES);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!hasRole("tutor")) {
      router.push("/");
      return;
    }

    if (courseId && token) {
      loadCourse();
    }
    fetchFaculties();
  }, [courseId, token, isAuthenticated, hasRole, router]);

  const fetchFaculties = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/faculties?include=departments`);
      const data = await res.json();
      const list: Faculty[] = Array.isArray(data.data) ? data.data : (data.data?.faculties ?? []);
      if (data.success && list.length > 0) setFaculties(list);
    } catch { /* initialized with FALLBACK_FACULTIES */ }
  };

  const loadCourse = async () => {
    if (!token || !courseId) return;

    try {
      setLoading(true);
      setError(null);

      console.log("Loading course with ID:", courseId);
      const response = await courseService.getCourseById(courseId);
      console.log("Course response:", response);

      if (response.success && response.data) {
        const course = response.data.course || response.data;
        console.log("Course data:", course);

        setFormData({
          title: course.title || "",
          shortDescription: course.shortDescription || "",
          description: course.description || "",
          aboutCourse: course.aboutCourse || "",
          level: course.level || "beginner",
          duration: course.duration != null ? course.duration.toString() : "",
          facultyId: course.facultyId != null ? course.facultyId.toString() : "",
          departmentId: course.departmentId != null ? course.departmentId.toString() : "",
          year: course.year != null ? course.year.toString() : "",
        });
        setCurrentThumbnail(course.thumbnail || null);
        if (course.facultyId) {
          const faculty = FALLBACK_FACULTIES.find(f => f.id === course.facultyId);
          setDepartments(faculty?.departments ?? []);
        }

        // Load course materials/content
        loadCourseMaterials();
      } else {
        setError("Course not found");
      }
    } catch (error) {
      console.error("Failed to load course:", error);
      setError("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "facultyId") {
        updated.departmentId = "";
        const faculty = faculties.find((f) => f.id === parseInt(value));
        setDepartments(faculty?.departments ?? []);
      }
      return updated;
    });
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file (JPEG or PNG)");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("Thumbnail file size should not exceed 5MB");
        return;
      }

      setThumbnailFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const loadCourseMaterials = async () => {
    if (!token || !courseId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/courses/${courseId}/content`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setMaterials(
            data.data.contents.map((content: any) => ({
              id: content.id,
              title: content.title,
              type: content.type,
              url: content.url,
              duration: content.duration,
              order: content.order,
            })),
          );
        }
      }
    } catch (error) {
      console.error("Failed to load materials:", error);
    }
  };

  const handleMaterialChange = (field: string, value: any) => {
    setCurrentMaterial((prev) => ({ ...prev, [field]: value }));
  };

  const handleMaterialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (currentMaterial.type === "video") {
      if (!file.type.startsWith("video/")) {
        alert("Please select a valid video file");
        return;
      }

      if (file.size > MAX_VIDEO_UPLOAD_MB * 1024 * 1024) {
        alert(
          `Video file size must be less than ${MAX_VIDEO_UPLOAD_MB}MB (current server limit).`,
        );
        return;
      }
    }

    if (currentMaterial.type === "pdf" && file.size > 10 * 1024 * 1024) {
      alert("PDF file size must be less than 10MB");
      return;
    }

    setCurrentMaterial((prev) => ({ ...prev, file }));
  };

  const handleAddMaterial = () => {
    if (!currentMaterial.title || !currentMaterial.file) {
      alert("Please provide a title and file for the material");
      return;
    }

    if (!currentMaterial.order) {
      alert("Please provide a display order for the material");
      return;
    }

    const newMaterial: CourseMaterial = {
      id: Date.now().toString(),
      title: currentMaterial.title,
      type: currentMaterial.type,
      file: currentMaterial.file,
      duration: currentMaterial.duration
        ? parseInt(currentMaterial.duration)
        : undefined,
      order: parseInt(currentMaterial.order),
    };

    setMaterials([...materials, newMaterial]);
    setCurrentMaterial({
      title: "",
      type: "video",
      file: null,
      duration: "",
      order: "",
    });
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const handleSaveMaterials = async () => {
    if (!token || !courseId) return;

    setSubmitting(true);
    try {
      for (const material of materials) {
        // Skip if material already has a URL (already uploaded)
        if (material.url) continue;

        if (!material.file) continue;

        const materialFormData = new FormData();
        materialFormData.append("title", material.title);
        materialFormData.append("type", material.type);
        materialFormData.append(
          "order",
          materials.indexOf(material).toString(),
        );

        if (material.duration) {
          materialFormData.append("duration", material.duration.toString());
        }

        materialFormData.append("video", material.file);

        const uploadResponse = await fetch(
          `${API_BASE_URL}/courses/${courseId}/content?type=${encodeURIComponent(material.type)}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: materialFormData,
          },
        );

        if (!uploadResponse.ok) {
          let errorMessage = `Failed to upload material "${material.title}"`;
          try {
            const errorData = await uploadResponse.json();
            if (errorData?.message) {
              errorMessage = errorData.message;
            }
          } catch {
            if (uploadResponse.status === 413) {
              errorMessage = `Upload too large. Keep video files under ${MAX_VIDEO_UPLOAD_MB}MB.`;
            }
          }
          throw new Error(errorMessage);
        }
      }

      alert("Materials saved successfully!");
      loadCourseMaterials();
    } catch (error) {
      console.error("Failed to save materials:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save some materials";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const hasUnsavedMaterials = materials.some(
    (material) => Boolean(material.file) && !material.url,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !courseId) return;

    setSubmitting(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("shortDescription", formData.shortDescription);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("aboutCourse", formData.aboutCourse);
      formDataToSend.append("price", "0");
      formDataToSend.append("level", formData.level);
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("facultyId", formData.facultyId || "");
      formDataToSend.append("departmentId", formData.departmentId || "");
      formDataToSend.append("year", formData.year || "");

      // Add thumbnail file if selected
      if (thumbnailFile) {
        formDataToSend.append("thumbnail", thumbnailFile);
      }

      // Use fetch directly for multipart/form-data
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        alert("Course updated successfully!");
        router.push("/tutor/dashboard");
      } else {
        setError(result.message || "Failed to update course");
      }
    } catch (error) {
      console.error("Failed to update course:", error);
      setError("Failed to update course. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="text-xl">Loading course...</div>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="container-custom py-8 max-w-4xl">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Edit Course</h1>
        <p className="text-gray-600">
          Update your course details and materials
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            activeTab === "details"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Course Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("materials")}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            activeTab === "materials"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Course Materials
          {materials.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
              {materials.length}
            </span>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Details Tab */}
        {activeTab === "details" && (
          <>
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Course Details
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Complete Web Development Bootcamp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Short Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="shortDescription"
                    required
                    maxLength={500}
                    value={formData.shortDescription}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="A brief summary for the course card (max 500 characters)"
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {formData.shortDescription.length}/500
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what students will learn in this course..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    About Course
                  </label>
                  <textarea
                    name="aboutCourse"
                    value={formData.aboutCourse}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detailed information, syllabus, learning points, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Difficulty Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="level"
                    required
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Faculty / Department / Year */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Faculty <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <select
                      name="facultyId"
                      value={formData.facultyId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">— Any Faculty —</option>
                      {faculties.map((f) => (
                        <option key={f.id} value={f.id}>{f.icon ? `${f.icon} ` : ""}{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      disabled={departments.length === 0}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">— Any Department —</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Academic Year <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">— Any Year —</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Duration
              </h2>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Duration (hours) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="20"
                />
              </div>
            </div>

            {/* Course Thumbnail */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Course Thumbnail
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Thumbnail{" "}
                  {!currentThumbnail && <span className="text-red-500">*</span>}
                </label>

                {/* Current thumbnail display */}
                {(currentThumbnail || thumbnailPreview) && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {thumbnailPreview
                        ? "New thumbnail preview:"
                        : "Current thumbnail:"}
                    </p>
                    <img
                      src={
                        thumbnailPreview ||
                        (currentThumbnail?.startsWith("http")
                          ? currentThumbnail
                          : `${BACKEND_URL}${currentThumbnail}`)
                      }
                      alt="Course thumbnail"
                      className="max-w-md h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleThumbnailChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Upload JPEG or PNG image. Max size: 5MB. Recommended: 1280x720
                  pixels
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end pt-4">
              <button
                type="button"
                onClick={() => router.push("/tutor/dashboard")}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  "Update Course"
                )}
              </button>
            </div>
          </>
        )}

        {/* Course Materials Tab */}
        {activeTab === "materials" && (
          <div className="space-y-6">
            {/* Existing Materials */}
            {materials.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Existing Materials
                </h2>
                <div className="space-y-4">
                  {materials.map((material, index) => (
                    <div
                      key={material.id || index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-shrink-0">
                          {material.type === "video" ? (
                            <svg
                              className="w-10 h-10 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-10 h-10 text-red-500"
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
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {material.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500 capitalize">
                              {material.type}
                            </span>
                            {material.duration && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-sm text-gray-500">
                                  {material.duration} min
                                </span>
                              </>
                            )}
                            <span className="text-gray-300">•</span>
                            <span className="text-sm text-gray-500">
                              Order: {material.order}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(material.id!)}
                        className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove material"
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
                  ))}
                </div>
              </div>
            )}

            {/* Add New Material */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Add New Material
              </h2>

              <div className="space-y-6">
                {/* Material Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Material Title *
                  </label>
                  <input
                    type="text"
                    value={currentMaterial.title}
                    onChange={(e) =>
                      handleMaterialChange("title", e.target.value)
                    }
                    placeholder="e.g., Introduction to React Hooks"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Material Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Material Type *
                  </label>
                  <select
                    value={currentMaterial.type}
                    onChange={(e) =>
                      handleMaterialChange(
                        "type",
                        e.target.value as "video" | "pdf",
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="video">Video</option>
                    <option value="pdf">PDF Document</option>
                  </select>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload File *
                  </label>
                  <input
                    type="file"
                    accept={
                      currentMaterial.type === "video"
                        ? "video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv"
                        : "application/pdf"
                    }
                    onChange={handleMaterialFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {currentMaterial.type === "video"
                      ? `Accepted formats: MP4, MOV, AVI, WMV. Max size: ${MAX_VIDEO_UPLOAD_MB}MB`
                      : "Accepted format: PDF. Max size: 10MB"}
                  </p>
                </div>

                {/* Duration (for videos) */}
                {currentMaterial.type === "video" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={currentMaterial.duration || ""}
                      onChange={(e) =>
                        handleMaterialChange("duration", e.target.value)
                      }
                      placeholder="e.g., 15"
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Order */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Order *
                  </label>
                  <input
                    type="number"
                    value={currentMaterial.order || ""}
                    onChange={(e) =>
                      handleMaterialChange("order", e.target.value)
                    }
                    placeholder="e.g., 1"
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Materials will be displayed in this order in the course
                  </p>
                </div>

                {/* Add Material Button */}
                <button
                  type="button"
                  onClick={handleAddMaterial}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                >
                  Add to Materials List
                </button>
              </div>
            </div>

            {/* Save Materials Button */}
            <div className="flex gap-4 justify-end pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Back to Details
              </button>
              <button
                type="button"
                onClick={handleSaveMaterials}
                disabled={!hasUnsavedMaterials || submitting}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Materials
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
