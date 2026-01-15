"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { courseService } from "@/services/course.service";

interface CourseMaterial {
  id: string;
  title: string;
  type: "video" | "pdf";
  file?: File;
  duration?: number;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const { token, isAuthenticated, hasRole } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    duration: "",
  });

  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState({
    title: "",
    type: "video" as "video" | "pdf",
    file: null as File | null,
    duration: "",
  });

  const categories = [
    "Programming",
    "Web Development",
    "Data Science",
    "Mobile Development",
    "Design",
    "Business",
    "Marketing",
    "Mathematics",
    "Personal Development",
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!hasRole("tutor")) {
      router.push("/");
      return;
    }
  }, [isAuthenticated, hasRole, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
        // Max 500MB for videos
        if (file.size > 500 * 1024 * 1024) {
          alert("Video file size must be less than 500MB");
          return;
        }
      }
      setCurrentMaterial((prev) => ({ ...prev, file }));
    }
  };

  const handleMaterialChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
    };

    setMaterials([...materials, newMaterial]);
    setCurrentMaterial({ title: "", type: "video", file: null, duration: "" });
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

    setLoading(true);
    setError(null);

    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("level", formData.level);
      formDataToSend.append("duration", formData.duration);
      formDataToSend.append("thumbnail", thumbnailFile);

      // Make API call with FormData
      const response = await fetch("http://localhost:5000/api/courses", {
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
        "You haven't added any materials. Do you want to add them later?"
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
          materials.indexOf(material).toString()
        );

        if (material.duration) {
          materialFormData.append("duration", material.duration.toString());
        }

        if (material.file) {
          materialFormData.append("video", material.file);
        }

        await fetch(
          `http://localhost:5000/api/courses/${createdCourseId}/content`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: materialFormData,
          }
        );
      }

      alert("Course and materials created successfully!");
      router.push("/tutor/dashboard");
    } catch (error) {
      console.error("Failed to save materials:", error);
      alert("Course created but failed to save some materials");
      router.push("/tutor/dashboard");
    } finally {
      setLoading(false);
    }
  };

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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
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
                      unlisted. Max size: 500MB
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
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-bold text-gray-400">
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
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
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition"
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
