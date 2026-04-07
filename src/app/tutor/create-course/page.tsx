"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { courseService } from "@/services/course.service";
import { API_BASE_URL, BACKEND_URL } from "@/lib/constants";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Loading } from "@/components/ui";
import type { Category } from "@/types";

interface CourseMaterial {
  id: string;
  title: string;
  type: "video" | "pdf";
  file?: File;
  duration?: number;
  isPreview?: boolean;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const { token, isAuthenticated, hasRole } = useAuth();
  const { isChecking, roleError } = useRoleCheck({
    requiredRole: "tutor",
    requireApproval: false,
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  // Categories management
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    aboutCourse: "",
    price: "",
    categoryId: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    duration: "",
  });

  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState({
    title: "",
    type: "video" as "video" | "pdf",
    file: null as File | null,
    duration: "",
    isPreview: false,
  });

  const MAX_VIDEO_UPLOAD_MB = Number(
    process.env.NEXT_PUBLIC_MAX_VIDEO_UPLOAD_MB || 5000,
  );

  // Fetch categories on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!hasRole("tutor")) {
      router.push("/");
      return;
    }

    fetchCategories();
  }, [isAuthenticated, hasRole, router]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    setCategoryLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategoryName }),
      });

      const data = await response.json();

      if (data.success) {
        setCategories([...categories, data.data]);
        setFormData((prev) => ({
          ...prev,
          categoryId: data.data.id.toString(),
        }));
        setShowAddCategory(false);
        setNewCategoryName("");
        alert("Category created successfully!");
      } else {
        alert(data.message || "Failed to create category");
      }
    } catch (error) {
      console.error("Failed to create category:", error);
      alert("Failed to create category");
    } finally {
      setCategoryLoading(false);
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
      if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
        alert("Only JPEG and PNG images are allowed");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setThumbnailFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMaterialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type based on material type
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
      setCurrentMaterial((prev) => ({ ...prev, file }));
    }
  };

  const handleMaterialChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setCurrentMaterial((prev) => ({ ...prev, [name]: value }));
  };

  const addMaterial = () => {
    if (!currentMaterial.title || !currentMaterial.file) {
      alert("Please fill in title and select a file");
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
      isPreview: currentMaterial.isPreview,
    };

    setMaterials([...materials, newMaterial]);
    setCurrentMaterial({
      title: "",
      type: "video",
      file: null,
      duration: "",
      isPreview: false,
    });
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Please login to create a course");
      return;
    }

    if (!thumbnailFile) {
      setError("Please upload a thumbnail image");
      return;
    }

    if (!formData.categoryId) {
      setError("Please select or create a category");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.shortDescription);
      formDataToSend.append("shortDescription", formData.shortDescription);
      formDataToSend.append("aboutCourse", formData.aboutCourse || "");
      formDataToSend.append("price", formData.price);
      formDataToSend.append("categoryId", formData.categoryId);
      formDataToSend.append("level", formData.level);
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("thumbnail", thumbnailFile);

      // Make API call with FormData
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success && result.data) {
        setCreatedCourseId(result.data.course.id);
        setStep(2);
      } else {
        setError(result.message || "Failed to create course");
      }
    } catch (error) {
      console.error("Failed to create course:", error);
      setError("Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (materials.length === 0) {
      const confirm = window.confirm(
        "You haven't added any materials. Do you want to add them later?",
      );
      if (confirm) {
        router.push("/tutor/dashboard");
      }
      return;
    }

    setLoading(true);
    try {
      // Upload materials one by one with file upload
      for (const material of materials) {
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

        if (material.isPreview) {
          materialFormData.append("isPreview", "true");
        }

        if (material.file) {
          materialFormData.append("video", material.file);
        }

        const uploadResponse = await fetch(
          `${API_BASE_URL}/courses/${createdCourseId}/content?type=${encodeURIComponent(material.type)}`,
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

      alert("Course and materials created successfully!");
      router.push("/tutor/dashboard");
    } catch (error) {
      console.error("Failed to save materials:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Course created but failed to save some materials";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create New Course
          </h1>
          <p className="text-gray-600">
            {step === 1
              ? "Step 1: Basic Information"
              : "Step 2: Add Course Materials"}
          </p>
        </div>

        <div className="mb-8 flex items-center">
          <div
            className={`flex items-center ${
              step >= 1 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              1
            </div>
            <span className="ml-2 font-medium">Basic Info</span>
          </div>
          <div
            className={`flex-1 h-1 mx-4 ${
              step >= 2 ? "bg-blue-600" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`flex items-center ${
              step >= 2 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              2
            </div>
            <span className="ml-2 font-medium">Materials</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
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
                    value={formData.shortDescription}
                    onChange={handleChange}
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description (shown on course listings)..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.shortDescription.length}/500 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    About Course{" "}
                    <span className="text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    name="aboutCourse"
                    value={formData.aboutCourse}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detailed course information including lessons breakdown, learning points, difficulty level, requirements, etc..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="categoryId"
                        required
                        value={formData.categoryId}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(!showAddCategory)}
                        className="px-4 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-medium"
                      >
                        + Add New
                      </button>
                    </div>
                    {showAddCategory && (
                      <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="Enter category name..."
                          className="w-full px-3 py-2 border border-blue-300 rounded mb-3"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleAddCategory();
                            }
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleAddCategory}
                            disabled={categoryLoading}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {categoryLoading ? "Creating..." : "Create"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddCategory(false);
                              setNewCategoryName("");
                            }}
                            className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
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
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price (LKR) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-500">
                        ₨
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Thumbnail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleThumbnailChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Upload JPEG or PNG image. Max size: 5MB. Recommended:
                    1280x720 pixels
                  </p>
                  {thumbnailPreview && (
                    <div className="mt-4">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="max-w-md h-auto rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => router.push("/tutor/dashboard")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Next: Add Materials"}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Add Course Materials
              </h2>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Material Type
                    </label>
                    <select
                      name="type"
                      value={currentMaterial.type}
                      onChange={handleMaterialChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="video">Video Lesson</option>
                      <option value="pdf">PDF Document</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Lesson Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={currentMaterial.title}
                      onChange={handleMaterialChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Introduction to React"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {currentMaterial.type === "video"
                      ? "Upload Video File"
                      : "Upload PDF File"}
                  </label>
                  <input
                    type="file"
                    accept={
                      currentMaterial.type === "video"
                        ? "video/*"
                        : "application/pdf"
                    }
                    onChange={handleMaterialFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {currentMaterial.type === "video" && (
                    <p className="text-sm text-gray-500 mt-2">
                      🎥 Video will be automatically uploaded to YouTube as
                      unlisted. Max size: {MAX_VIDEO_UPLOAD_MB}MB
                    </p>
                  )}
                  {currentMaterial.type === "pdf" && (
                    <p className="text-sm text-gray-500 mt-2">
                      📄 PDF files will be stored securely on the server
                    </p>
                  )}
                  {currentMaterial.file && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Selected: {currentMaterial.file.name} (
                      {(currentMaterial.file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {currentMaterial.type === "video" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      min="1"
                      value={currentMaterial.duration}
                      onChange={handleMaterialChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="15"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="isPreview"
                    checked={currentMaterial.isPreview}
                    onChange={(e) =>
                      setCurrentMaterial((prev) => ({
                        ...prev,
                        isPreview: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isPreview"
                    className="text-sm font-semibold text-gray-700 cursor-pointer"
                  >
                    🔓 Make this material FREE PREVIEW - Students can watch
                    without enrolling
                  </label>
                </div>

                <button
                  type="button"
                  onClick={addMaterial}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
                >
                  + Add Material
                </button>
              </div>
            </div>

            {materials.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Added Materials ({materials.length})
                </h3>
                <div className="space-y-3">
                  {materials.map((material, index) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <span className="text-lg font-bold text-gray-400">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-2">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                material.type === "video"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {material.type === "video"
                                ? "📹 VIDEO"
                                : "📄 PDF"}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {material.title}
                            </span>
                            {material.isPreview && (
                              <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                                🔓 FREE PREVIEW
                              </span>
                            )}
                          </div>
                          {material.file && (
                            <p className="text-sm text-gray-500 mt-1">
                              File: {material.file.name} (
                              {(material.file.size / 1024 / 1024).toFixed(2)}{" "}
                              MB)
                            </p>
                          )}
                          {material.duration && (
                            <p className="text-sm text-gray-500 mt-1">
                              Duration: {material.duration} minutes
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeMaterial(material.id)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition ml-4 flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Back to Basic Info
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Saving..."
                  : materials.length > 0
                    ? "Finish & Save All"
                    : "Skip Materials"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
