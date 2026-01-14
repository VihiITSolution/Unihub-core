"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useDashboardPath } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";

// Sri Lankan Universities
const UNIVERSITIES = [
  "University of Colombo",
  "University of Peradeniya",
  "University of Sri Jayewardenepura",
  "University of Kelaniya",
  "University of Moratuwa",
  "University of Jaffna",
  "University of Ruhuna",
  "Eastern University, Sri Lanka",
  "South Eastern University of Sri Lanka",
  "Rajarata University of Sri Lanka",
  "Sabaragamuwa University of Sri Lanka",
  "Wayamba University of Sri Lanka",
  "Uva Wellassa University",
  "University of the Visual and Performing Arts",
  "Open University of Sri Lanka",
  "SLIIT",
  "NSBM Green University",
  "IIT - Informatics Institute of Technology",
  "NIBM - National Institute of Business Management",
  "Other",
];

interface FormData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  
  // Role Selection
  roles: UserRole[];
  primaryRole: UserRole;
  
  // Student Profile
  universityName: string;
  department: string;
  degreeOrCourse: string;
  studyingArea: string;
  currentYear: number;
  currentSemester: number;
  studentIdNumber: string;
  currentAddress: string;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  roles: ["student"],
  primaryRole: "student",
  universityName: "",
  department: "",
  degreeOrCourse: "",
  studyingArea: "",
  currentYear: 1,
  currentSemester: 1,
  studentIdNumber: "",
  currentAddress: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const dashboardPath = useDashboardPath();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const totalSteps = 3;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleRoleToggle = (role: UserRole) => {
    setFormData((prev) => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      
      // Ensure at least one role is selected
      if (roles.length === 0) {
        return prev;
      }
      
      // Update primary role if current primary is being removed
      const primaryRole = roles.includes(prev.primaryRole) ? prev.primaryRole : roles[0];
      
      return { ...prev, roles, primaryRole };
    });
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Please enter your full name");
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.roles.length === 0) {
      setError("Please select at least one role");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (formData.roles.includes("student")) {
      if (!formData.universityName) {
        setError("Please select your university");
        return false;
      }
      if (!formData.department.trim()) {
        setError("Please enter your department");
        return false;
      }
      if (!formData.degreeOrCourse.trim()) {
        setError("Please enter your degree/course");
        return false;
      }
    }
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep3()) return;

    setLoading(true);
    setError(null);

    try {
      const registerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        roles: formData.roles,
        primaryRole: formData.primaryRole,
        phoneNumber: formData.phoneNumber || undefined,
        studentProfile: formData.roles.includes("student")
          ? {
              universityName: formData.universityName,
              department: formData.department,
              degreeOrCourse: formData.degreeOrCourse,
              studyingArea: formData.studyingArea || undefined,
              currentYear: formData.currentYear,
              currentSemester: formData.currentSemester,
              studentIdNumber: formData.studentIdNumber || undefined,
              currentAddress: formData.currentAddress || undefined,
              phoneNumber: formData.phoneNumber || undefined,
            }
          : undefined,
      };

      const result = await register(registerData);

      if (result.success) {
        // Get redirect path based on role
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || dashboardPath;
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);
      } else {
        setError(result.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-ocean-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white">
              Uni<span className="text-amber-500">Hub</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">LEARN. EARN. GROW.</p>
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  s < step
                    ? "bg-ocean-500 text-white"
                    : s === step
                    ? "bg-amber-500 text-navy-900"
                    : "bg-navy-800 text-gray-400"
                }`}
              >
                {s < step ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  s
                )}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-1 mx-2 rounded ${
                    s < step ? "bg-ocean-500" : "bg-navy-800"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div className="flex justify-between text-xs text-gray-400 mb-6 px-2">
          <span className={step >= 1 ? "text-ocean-400" : ""}>Account</span>
          <span className={step >= 2 ? "text-ocean-400" : ""}>Role</span>
          <span className={step >= 3 ? "text-ocean-400" : ""}>Profile</span>
        </div>

        {/* Card */}
        <div className="bg-navy-900/50 backdrop-blur-lg rounded-2xl p-8 border border-navy-800 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">
            {step === 1 && "Create Your Account"}
            {step === 2 && "Choose Your Role"}
            {step === 3 && "Complete Your Profile"}
          </h2>
          <p className="text-gray-400 mb-6">
            {step === 1 && "Enter your basic information to get started"}
            {step === 2 && "Select how you want to use UniHub"}
            {step === 3 && "Tell us more about yourself"}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={step === totalSteps ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300 mb-1">
                    Phone Number <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                    placeholder="+94 77 123 4567"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Role Selection */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {/* Student Role */}
                  <button
                    type="button"
                    onClick={() => handleRoleToggle("student")}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                      formData.roles.includes("student")
                        ? "border-ocean-500 bg-ocean-500/10"
                        : "border-navy-700 bg-navy-800 hover:border-navy-600"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      formData.roles.includes("student") ? "bg-ocean-500" : "bg-navy-700"
                    }`}>
                      {formData.roles.includes("student") && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-semibold">🎓 Student</h3>
                      <p className="text-gray-400 text-sm">Browse and enroll in Kuppi sessions, learn from your peers</p>
                    </div>
                  </button>

                  {/* Tutor Role */}
                  <button
                    type="button"
                    onClick={() => handleRoleToggle("tutor")}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                      formData.roles.includes("tutor")
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-navy-700 bg-navy-800 hover:border-navy-600"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      formData.roles.includes("tutor") ? "bg-amber-500" : "bg-navy-700"
                    }`}>
                      {formData.roles.includes("tutor") && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-semibold">📚 Tutor</h3>
                      <p className="text-gray-400 text-sm">Create and host Kuppi sessions, earn money by teaching</p>
                      <p className="text-amber-400 text-xs mt-1">Requires admin approval</p>
                    </div>
                  </button>
                </div>

                {formData.roles.length > 1 && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Primary Role (for dashboard)
                    </label>
                    <select
                      name="primaryRole"
                      value={formData.primaryRole}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                    >
                      {formData.roles.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Profile Details */}
            {step === 3 && (
              <div className="space-y-4">
                {formData.roles.includes("student") && (
                  <>
                    <div>
                      <label htmlFor="universityName" className="block text-sm font-medium text-gray-300 mb-1">
                        University
                      </label>
                      <select
                        id="universityName"
                        name="universityName"
                        required
                        value={formData.universityName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select your university</option>
                        {UNIVERSITIES.map((uni) => (
                          <option key={uni} value={uni}>
                            {uni}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-300 mb-1">
                          Department
                        </label>
                        <input
                          id="department"
                          name="department"
                          type="text"
                          required
                          value={formData.department}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                          placeholder="Computer Science"
                        />
                      </div>
                      <div>
                        <label htmlFor="degreeOrCourse" className="block text-sm font-medium text-gray-300 mb-1">
                          Degree/Course
                        </label>
                        <input
                          id="degreeOrCourse"
                          name="degreeOrCourse"
                          type="text"
                          required
                          value={formData.degreeOrCourse}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                          placeholder="BSc (Hons)"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="studyingArea" className="block text-sm font-medium text-gray-300 mb-1">
                        Studying Area <span className="text-gray-500">(optional)</span>
                      </label>
                      <input
                        id="studyingArea"
                        name="studyingArea"
                        type="text"
                        value={formData.studyingArea}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                        placeholder="Software Engineering"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="currentYear" className="block text-sm font-medium text-gray-300 mb-1">
                          Current Year
                        </label>
                        <select
                          id="currentYear"
                          name="currentYear"
                          value={formData.currentYear}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                        >
                          {[1, 2, 3, 4, 5, 6].map((year) => (
                            <option key={year} value={year}>
                              Year {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="currentSemester" className="block text-sm font-medium text-gray-300 mb-1">
                          Current Semester
                        </label>
                        <select
                          id="currentSemester"
                          name="currentSemester"
                          value={formData.currentSemester}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                        >
                          <option value={1}>Semester 1</option>
                          <option value={2}>Semester 2</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="studentIdNumber" className="block text-sm font-medium text-gray-300 mb-1">
                        Student ID <span className="text-gray-500">(optional)</span>
                      </label>
                      <input
                        id="studentIdNumber"
                        name="studentIdNumber"
                        type="text"
                        value={formData.studentIdNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                        placeholder="e.g., 2021CS001"
                      />
                    </div>

                    <div>
                      <label htmlFor="currentAddress" className="block text-sm font-medium text-gray-300 mb-1">
                        Current Address <span className="text-gray-500">(optional)</span>
                      </label>
                      <textarea
                        id="currentAddress"
                        name="currentAddress"
                        rows={2}
                        value={formData.currentAddress}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all resize-none"
                        placeholder="Your current address"
                      />
                    </div>
                  </>
                )}

                {/* Terms and Conditions */}
                <div className="flex items-start mt-6">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="h-4 w-4 mt-1 text-ocean-500 focus:ring-ocean-500 border-navy-600 rounded bg-navy-800"
                  />
                  <label htmlFor="terms" className="ml-3 text-sm text-gray-300">
                    I agree to the{" "}
                    <Link href="/terms" className="text-ocean-400 hover:underline">
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-ocean-400 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-6 py-3 bg-navy-800 text-white rounded-lg font-medium hover:bg-navy-700 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                  step === totalSteps
                    ? "bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading
                  ? "Creating account..."
                  : step === totalSteps
                  ? "Create Account"
                  : "Continue"}
              </button>
            </div>
          </form>
        </div>

        {/* Login Link */}
        <p className="mt-6 text-center text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-ocean-400 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
