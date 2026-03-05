"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { tutorService } from "@/services/tutor.service";

const EXPERTISE_OPTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Engineering",
  "Business Studies",
  "Economics",
  "Accounting",
  "English Literature",
  "History",
  "Geography",
  "Psychology",
  "Sociology",
  "Law",
  "Medicine",
  "Other",
];

export default function BecomeTutorPage() {
  const router = useRouter();
  const { user, token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    qualifications: "",
    expertiseAreas: [] as string[],
    bio: "",
    yearsOfExperience: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Please login to continue");
      return;
    }

    if (formData.expertiseAreas.length === 0) {
      setError("Please select at least one area of expertise");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await tutorService.applyAsTutor(formData, token);

      if (response.success) {
        setSuccess(true);
        // Refresh user data
        await refreshUser?.();
      } else {
        setError(response.message || "Failed to submit tutor application");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleExpertiseToggle = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      expertiseAreas: prev.expertiseAreas.includes(area)
        ? prev.expertiseAreas.filter((a) => a !== area)
        : [...prev.expertiseAreas, area],
    }));
  };

  // Check if user already has tutor profile
  if (user?.isTutorProfileComplete) {
    const isApproved = user?.tutorProfile?.isApproved;
    const approvalStatus = user?.tutorProfile?.approvalStatus;

    return (
      <div className="container-custom py-12 text-center max-w-2xl">
        <div
          className={`p-8 rounded-lg ${
            isApproved
              ? "bg-green-50 border-green-200"
              : "bg-yellow-50 border-yellow-200"
          } border`}
        >
          <h1 className="text-3xl font-bold mb-4">
            {isApproved ? "You're a Tutor!" : "Application Pending"}
          </h1>
          <p className="text-gray-600 mb-6">
            {isApproved
              ? "Your tutor application has been approved. You can now create courses and teach students."
              : approvalStatus === "pending"
                ? "Your tutor application is under review. We'll notify you once it's been reviewed by our admin team."
                : "Your tutor application status: " + approvalStatus}
          </p>
          {isApproved ? (
            <button
              onClick={() => router.push("/tutor/dashboard")}
              className="btn-primary"
            >
              Go to Tutor Dashboard
            </button>
          ) : (
            <button
              onClick={() => router.push("/student/dashboard")}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show success message after submission
  if (success) {
    return (
      <div className="container-custom py-12 text-center max-w-2xl">
        <div className="bg-green-50 border border-green-200 p-8 rounded-lg">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Your tutor application has been submitted successfully. Our admin
            team will review your application and get back to you soon.
          </p>
          <div className="space-y-3 mb-6 text-left bg-white p-4 rounded border">
            <p className="text-sm font-semibold text-gray-700">
              What happens next?
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ Admin will review your qualifications and expertise</li>
              <li>✓ You'll receive a notification about the decision</li>
              <li>✓ If approved, you can start creating courses immediately</li>
            </ul>
          </div>
          <button
            onClick={() => router.push("/student/dashboard")}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Become a Tutor</h1>
        <p className="text-gray-600">
          Share your knowledge and help students succeed. Fill in your details
          below to apply as a tutor on UniHub.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-6">
          {/* Qualifications */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Qualifications</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Qualifications & Education
              </label>
              <textarea
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                rows={4}
                className="input-field"
                placeholder="e.g., Bachelor's in Computer Science, Master's in Mathematics, PhD in Physics..."
              />
              <p className="text-xs text-gray-500 mt-1">
                List your degrees, certifications, or relevant educational
                background
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Years of Teaching Experience
              </label>
              <input
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                min="0"
                max="50"
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>

          {/* Expertise Areas */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Areas of Expertise <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Select the subjects you can teach. Choose at least one.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {EXPERTISE_OPTIONS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleExpertiseToggle(area)}
                  className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                    formData.expertiseAreas.includes(area)
                      ? "bg-ocean-500 text-white border-ocean-500"
                      : "bg-white text-gray-700 border-gray-300 hover:border-ocean-300"
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">About You</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Bio / Introduction
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={6}
                className="input-field"
                placeholder="Tell students about yourself, your teaching style, and what makes you a great tutor..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be displayed on your tutor profile
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading || formData.expertiseAreas.length === 0}
            >
              {loading
                ? "Submitting Application..."
                : "Submit Tutor Application"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold mb-2 text-blue-900">
          Application Process
        </h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>
            1. Submit your tutor application with qualifications and expertise
          </li>
          <li>
            2. Admin team reviews your application (usually within 1-2 business
            days)
          </li>
          <li>3. Once approved, you'll receive a notification</li>
          <li>4. Start creating courses and teaching students!</li>
        </ul>
      </div>
    </div>
  );
}
