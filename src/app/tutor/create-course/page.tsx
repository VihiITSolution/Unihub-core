"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    level: "beginner",
    duration: "",
    thumbnail: "",
  });

  const categories = [
    "Web Development",
    "Data Science",
    "Mobile Development",
    "Design",
    "Business",
    "Marketing",
    "Personal Development",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API call would go here
      console.log("Creating course:", formData);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      alert("Course created successfully!");
      router.push("/tutor/dashboard");
    } catch (error) {
      console.error("Failed to create course:", error);
      alert("Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create New Course</h1>
        <p className="text-gray-600">
          Fill in the details to create your new course
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Basic Information</h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="label-text">
                Course Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Complete Web Development Bootcamp"
              />
            </div>

            <div>
              <label htmlFor="description" className="label-text">
                Course Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="input-field"
                placeholder="Describe what students will learn in this course..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="label-text">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
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
                <label htmlFor="level" className="label-text">
                  Difficulty Level *
                </label>
                <select
                  id="level"
                  name="level"
                  required
                  value={formData.level}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Duration */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Pricing & Duration</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="label-text">
                Course Price (USD) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="input-field"
                placeholder="99.99"
              />
            </div>

            <div>
              <label htmlFor="duration" className="label-text">
                Total Duration (minutes) *
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                required
                min="1"
                value={formData.duration}
                onChange={handleChange}
                className="input-field"
                placeholder="1200"
              />
            </div>
          </div>
        </div>

        {/* Course Media */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Course Media</h2>

          <div>
            <label htmlFor="thumbnail" className="label-text">
              Thumbnail URL
            </label>
            <input
              type="url"
              id="thumbnail"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              className="input-field"
              placeholder="https://example.com/thumbnail.jpg"
            />
            <p className="text-sm text-gray-600 mt-2">
              Upload a course thumbnail image (recommended size: 1280x720)
            </p>
          </div>
        </div>

        {/* Course Content */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Course Content</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              📝 After creating your course, you'll be able to add lessons,
              videos, PDFs, and quizzes from the course management page.
            </p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
