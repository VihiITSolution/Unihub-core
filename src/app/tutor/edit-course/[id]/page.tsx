"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL, BACKEND_URL } from "@/lib/constants";
import { courseService } from "@/services/course.service";

interface Faculty {
  id: number;
  name: string;
  icon?: string;
  description?: string;
}

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
    description: "",
    price: "",
    facultyId: "",
    year: "",
    duration: "",
  });

  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState({
    title: "",
    type: "video" as "video" | "pdf",
    file: null as File | null,
    duration: "",
    order: "",
  });

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [addingFaculty, setAddingFaculty] = useState(false);
  const [newFacultyName, setNewFacultyName] = useState("");
  const [newFacultyIcon, setNewFacultyIcon] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!hasRole("tutor")) {
      router.push("/");
      return;
    }

    loadFaculties();

    if (courseId && token) {
      loadCourse();
    }
  }, [courseId, token, isAuthenticated, hasRole, router]);

  const loadFaculties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/faculties`);
      const data = await response.json();
      if (data.success && data.data && Array.isArray(data.data.faculties)) {
        setFaculties(data.data.faculties);
      }
    } catch (error) {
      console.error("Failed to load faculties:", error);
    }
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
        const course = response.data;
        console.log("Course data:", course);

        setFormData({
          title: course.title || "",
          description: course.description || "",
          price: course.price != null ? course.price.toString() : "",
          facultyId: course.facultyId ? course.facultyId.toString() : "",
          year: course.year ? course.year.toString() : "",
          duration: course.duration != null ? course.duration.toString() : "",
        });
        setCurrentThumbnail(course.thumbnail || null);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        if (data.success && data.data && Array.isArray(data.data.contents)) {
          setMaterials(
            data.data.contents
              .filter((content: any) => content && content.type) // Filter out invalid entries
              .map((content: any) => ({
                id: content.id,
                title: content.title,
                type: content.type,
                url: content.url,
                duration: content.duration,
                order: content.order,
              })),
          );
        } else {
          setMaterials([]);
        }
      }
    } catch (error) {
      console.error("Failed to load materials:", error);
      setMaterials([]);
    }
  };

  const handleMaterialChange = (field: string, value: any) => {
    setCurrentMaterial((prev) => ({ ...prev, [field]: value }));
  };

  const handleMaterialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentMaterial((prev) => ({ ...prev, file }));
    }
  };

  const handleAddMaterial = async () => {
    if (!currentMaterial.title || !currentMaterial.file) {
      alert("Please provide a title and file for the material");
      return;
    }

    if (!currentMaterial.order) {
      alert("Please provide a display order for the material");
      return;
    }

    if (!token || !courseId) return;

    setSubmitting(true);
    setError(null);

    try {
      const materialFormData = new FormData();
      materialFormData.append("title", currentMaterial.title);
      materialFormData.append("type", currentMaterial.type);
      materialFormData.append("order", currentMaterial.order);

      if (currentMaterial.duration) {
        materialFormData.append("duration", currentMaterial.duration);
      }

      // Use correct field name based on type
      materialFormData.append("video", currentMaterial.file);

      const response = await fetch(
        `${API_BASE_URL}/courses/${courseId}/content?type=${currentMaterial.type}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: materialFormData,
        },
      );

      const result = await response.json();

      if (result.success) {
        alert("Material uploaded successfully!");
        // Reset form
        setCurrentMaterial({
          title: "",
          type: "video",
          file: null,
          duration: "",
          order: "",
        });
        // Reload materials list
        await loadCourseMaterials();
      } else {
        setError(result.message || "Failed to upload material");
      }
    } catch (error) {
      console.error("Failed to upload material:", error);
      setError("Failed to upload material. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleAddFaculty = async () => {
    if (!newFacultyName.trim()) {
      alert("Please enter a faculty name");
      return;
    }

    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/faculties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newFacultyName,
          icon: newFacultyIcon || "🎓",
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Faculty added successfully!");
        setNewFacultyName("");
        setNewFacultyIcon("");
        setAddingFaculty(false);
        await loadFaculties();
      } else {
        alert(result.message || "Failed to add faculty");
      }
    } catch (error) {
      console.error("Failed to add faculty:", error);
      alert("Failed to add faculty. Please try again.");
    }
  };
  const handleRemoveMaterial = async (id: string) => {
    if (!token || !courseId) return;

    if (
      !confirm(
        "Are you sure you want to delete this material? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/content/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        alert("Material deleted successfully!");
        await loadCourseMaterials();
      } else {
        alert(result.message || "Failed to delete material");
      }
    } catch (error) {
      console.error("Failed to delete material:", error);
      alert("Failed to delete material. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !courseId) return;

    setSubmitting(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("facultyId", formData.facultyId);
      formDataToSend.append("year", formData.year);
      formDataToSend.append("duration", formData.duration);

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

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Faculty <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setAddingFaculty(!addingFaculty)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        ➕ Add Faculty
                      </button>
                    </div>
                    <select
                      name="facultyId"
                      required
                      value={formData.facultyId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a faculty</option>
                      {faculties.map((faculty) => (
                        <option key={faculty.id} value={faculty.id}>
                          {faculty.icon} {faculty.name}
                        </option>
                      ))}
                    </select>
                    {addingFaculty && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Faculty Name
                          </label>
                          <input
                            type="text"
                            value={newFacultyName}
                            onChange={(e) => setNewFacultyName(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Faculty of Computing"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Icon (emoji)
                          </label>
                          <input
                            type="text"
                            value={newFacultyIcon}
                            onChange={(e) => setNewFacultyIcon(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="🎓"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleAddFaculty}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAddingFaculty(false);
                              setNewFacultyName("");
                              setNewFacultyIcon("");
                            }}
                            className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Year Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="year"
                      required
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Duration */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Pricing & Duration
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="99.99"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Duration (hours){" "}
                    <span className="text-red-500">*</span>
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Course Materials
                  </h2>
                  <span className="text-sm text-gray-600">
                    {materials.length}{" "}
                    {materials.length === 1 ? "item" : "items"}
                  </span>
                </div>
                <div className="space-y-4">
                  {materials
                    .filter((material) => material && material.type) // Safety check
                    .map((material, index) => (
                      <div
                        key={material.id || index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-gray-50"
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
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                <svg
                                  className="w-4 h-4"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Uploaded
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterial(material.id!)}
                          className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete material"
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload New Material
              </h2>
              <p className="text-gray-600 mb-6">
                Add videos or PDF documents to your course. Materials will be
                uploaded immediately.
              </p>

              <div className="space-y-6">
                {/* Material Type - First */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Material Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={currentMaterial.type}
                    onChange={(e) =>
                      handleMaterialChange(
                        "type",
                        e.target.value as "video" | "pdf",
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="video">Video Lesson</option>
                    <option value="pdf">PDF Document</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">
                    {currentMaterial.type === "video"
                      ? "Upload video lessons for your course"
                      : "Upload PDF documents, slides, or reading materials"}
                  </p>
                </div>

                {/* Material Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Material Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentMaterial.title}
                    onChange={(e) =>
                      handleMaterialChange("title", e.target.value)
                    }
                    placeholder={
                      currentMaterial.type === "video"
                        ? "e.g., Introduction to React Hooks"
                        : "e.g., Course Syllabus and Resources"
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {currentMaterial.type === "video"
                      ? "Upload Video"
                      : "Upload PDF"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept={
                      currentMaterial.type === "video"
                        ? "video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv"
                        : "application/pdf"
                    }
                    onChange={handleMaterialFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {currentMaterial.file && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      File selected: {currentMaterial.file.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {currentMaterial.type === "video"
                      ? "Accepted: MP4, MOV, AVI, WMV. Max: 500MB"
                      : "Accepted: PDF only. Max: 10MB"}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
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
                      Display Order <span className="text-red-500">*</span>
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
                      Order in which materials appear (1 = first)
                    </p>
                  </div>
                </div>

                {/* Upload Material Button */}
                <div className="border-t border-gray-200 pt-6">
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    disabled={
                      submitting ||
                      !currentMaterial.title ||
                      !currentMaterial.file ||
                      !currentMaterial.order
                    }
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
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
                        Uploading...
                      </>
                    ) : (
                      <>
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
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        Upload{" "}
                        {currentMaterial.type === "video" ? "Video" : "PDF"} to
                        Course
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    {currentMaterial.type === "video"
                      ? "Video will be uploaded to YouTube and embedded in your course"
                      : "PDF will be available for students to view and download"}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-start pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                ← Back to Course Details
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
