"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { tutorService } from "@/services/tutor.service";

const TUTOR_BIO_MAX_LENGTH = 1000;

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
    graduationStatus: "" as "graduate" | "undergraduate" | "",
    expertiseAreas: [] as string[],
    coursesSubjects: [] as string[],
    bio: "",
    yearsOfExperience: 0,
    youtubeLink: "",
    blogLink: "",
    linkedinLink: "",
    remarks: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Please login to continue");
      return;
    }

    if (!formData.qualifications.trim()) {
      setError("Please list your qualifications & education");
      return;
    }

    if (formData.expertiseAreas.length === 0) {
      setError("Please select at least one area of expertise");
      return;
    }

    if (!formData.graduationStatus) {
      setError("Please select your graduation status");
      return;
    }

    if (formData.coursesSubjects.length === 0) {
      setError("Please select at least one subject you'll create courses on");
      return;
    }

    if (!formData.bio.trim()) {
      setError("Please write a short bio");
      return;
    }

    if (formData.bio.length > TUTOR_BIO_MAX_LENGTH) {
      setError(`Bio must be ${TUTOR_BIO_MAX_LENGTH} characters or fewer`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await tutorService.applyAsTutor(
        {
          ...formData,
          graduationStatus: formData.graduationStatus as
            | "graduate"
            | "undergraduate",
        },
        token,
      );

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Become a Tutor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your knowledge and help students succeed. Fill in your details
            below to apply as a tutor on UniHub.
          </p>
        </div>

        <section className="mb-8 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 p-6 text-white shadow-xl sm:p-8" aria-labelledby="tutor-rewards-title">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="mb-2 text-xs font-bold tracking-[0.16em] text-emerald-200">TUTOR VIDEO REWARDS · UNTIL FURTHER NOTICE</p>
              <h2 id="tutor-rewards-title" className="mb-2 text-2xl font-bold sm:text-3xl">Teach what you know. Get rewarded for it.</h2>
              <p className="text-sm leading-6 text-emerald-50">Share knowledge students can use while building your UniHub tutor profile.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:w-[480px]">
              <article className="rounded-xl border border-white/25 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Existing YouTube video</p>
                <p className="mt-1 text-2xl font-bold">LKR 300</p>
                <p className="mt-1 text-xs leading-5 text-emerald-50">For an eligible teaching video already on YouTube, 20 minutes or longer.</p>
              </article>
              <article className="rounded-xl border border-amber-200/60 bg-amber-300/15 p-4 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-100">Upload to UniHub</p>
                <p className="mt-1 text-2xl font-bold">LKR 500 <span className="text-sm">per video</span></p>
                <p className="mt-1 text-xs leading-5 text-emerald-50">For each eligible video you upload to UniHub.</p>
              </article>
            </div>
          </div>
          <div className="mt-5 flex items-start gap-2 border-t border-white/15 pt-4 text-xs leading-5 text-emerald-100">
            <span aria-hidden="true">✓</span>
            <span>All rewards are given only after UniHub reviews and approves the submitted video.</span>
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r-lg mb-8 shadow-sm">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-4 sm:p-8 space-y-10">
            {/* Academic Qualification Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b-2 border-ocean-500">
                <div className="p-2 bg-ocean-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-ocean-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l9-5-9-5-9 5 9 5z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Academic Qualification
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Qualifications & Education{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                    placeholder="e.g., Bachelor's in Computer Science, Master's in Mathematics, PhD in Physics..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    List your degrees, certifications, or relevant educational
                    background
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Graduation Status <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-ocean-300">
                      <input
                        type="radio"
                        name="graduationStatus"
                        value="graduate"
                        checked={formData.graduationStatus === "graduate"}
                        onChange={handleChange}
                        className="w-5 h-5 text-ocean-500 focus:ring-ocean-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        Graduate
                      </span>
                    </label>
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-ocean-300">
                      <input
                        type="radio"
                        name="graduationStatus"
                        value="undergraduate"
                        checked={formData.graduationStatus === "undergraduate"}
                        onChange={handleChange}
                        className="w-5 h-5 text-ocean-500 focus:ring-ocean-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        Undergraduate
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Years of Teaching Experience
                  </label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Portfolio Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b-2 border-purple-500">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Portfolio</h2>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Recommended:</strong> Add a YouTube teaching video
                      to show your teaching style. Videos that are 20 minutes or
                      longer may qualify for the LKR 300 reward after review.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    YouTube Channel / Introduction Video Link{" "}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="url"
                    name="youtubeLink"
                    value={formData.youtubeLink}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Blog / Website Link
                  </label>
                  <input
                    type="url"
                    name="blogLink"
                    value={formData.blogLink}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                    placeholder="https://yourblog.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    LinkedIn Profile Link
                  </label>
                  <input
                    type="url"
                    name="linkedinLink"
                    value={formData.linkedinLink}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            </div>

            {/* Areas of Expertise */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b-2 border-green-500">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Areas of Expertise <span className="text-red-500">*</span>
                </h2>
              </div>
              <p className="text-sm text-gray-600">
                Select the subjects you have expertise in. Choose at least one.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {EXPERTISE_OPTIONS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => handleExpertiseToggle(area)}
                    className={`p-4 border-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                      formData.expertiseAreas.includes(area)
                        ? "bg-ocean-500 text-white border-ocean-500 shadow-lg"
                        : "bg-white text-gray-700 border-gray-300 hover:border-ocean-400 hover:shadow-md"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Subjects for Courses */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b-2 border-amber-500">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Subjects You'll Create Courses On{" "}
                  <span className="text-red-500">*</span>
                </h2>
              </div>
              <p className="text-sm text-gray-600">
                Select the subjects you plan to create courses for. Choose at
                least one.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {EXPERTISE_OPTIONS.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        coursesSubjects: prev.coursesSubjects.includes(subject)
                          ? prev.coursesSubjects.filter((s) => s !== subject)
                          : [...prev.coursesSubjects, subject],
                      }));
                    }}
                    className={`p-4 border-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                      formData.coursesSubjects.includes(subject)
                        ? "bg-amber-500 text-white border-amber-500 shadow-lg"
                        : "bg-white text-gray-700 border-gray-300 hover:border-amber-400 hover:shadow-md"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* About You */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b-2 border-indigo-500">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">About You</h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio / Introduction <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={6}
                  maxLength={TUTOR_BIO_MAX_LENGTH}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                  placeholder="Tell students about yourself, your teaching style, and what makes you a great tutor..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {formData.bio.length}/{TUTOR_BIO_MAX_LENGTH} characters ·
                  This will be displayed on your tutor profile
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                  placeholder="Any additional information you'd like to share..."
                />
              </div>
            </div>
          </div>

          {/* Submit Section */}
          <div className="bg-gray-50 px-8 py-6 border-t-2 border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-4 bg-gradient-to-r from-ocean-500 to-ocean-600 text-white font-semibold rounded-xl hover:from-ocean-600 hover:to-ocean-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  loading ||
                  formData.expertiseAreas.length === 0 ||
                  !formData.graduationStatus ||
                  formData.coursesSubjects.length === 0
                }
              >
                {loading
                  ? "Submitting Application..."
                  : "Submit Tutor Application"}
              </button>
            </div>
          </div>
        </form>

        {/* Application Process Info */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6">
          <h3 className="font-semibold mb-3 text-blue-900 text-lg">
            Application Process
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span>
                Submit your tutor application with qualifications and expertise
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span>
                Admin team reviews your application (usually within 1-2 business
                days)
              </span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span>Once approved, you'll receive a notification</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">4.</span>
              <span>Start creating courses and teaching students!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
