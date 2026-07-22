"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useDashboardPath } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";
import { isValidPhone, hasLetters } from "@/lib/validation";
import { FALLBACK_FACULTIES } from "@/services/faculty.service";

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
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  accountType: "student" | "vendor";
  universityName: string;
  department: string;
  degreeOrCourse: string;
  studyingArea: string;
  currentYear: number;
  currentSemester: number;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  accountType: "student",
  universityName: "",
  department: "",
  degreeOrCourse: "",
  studyingArea: "",
  currentYear: 1,
  currentSemester: 1,
};

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  height: 44, padding: "0 14px",
  border: "1px solid var(--line)", borderRadius: 7,
  fontSize: 14, color: "var(--ink)",
  background: "#fff", outline: "none",
  transition: "border-color .15s",
};

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
        {label}
        {optional && <span style={{ fontWeight: 400, color: "var(--muted)", marginLeft: 4 }}>(optional)</span>}
      </label>
      {children}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const dashboardPath = useDashboardPath();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Faculty / department dropdown state
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
  const [selectedDeptName, setSelectedDeptName] = useState<string>("");
  const [customUniversity, setCustomUniversity] = useState("");
  const [customFaculty, setCustomFaculty] = useState("");
  const [customDepartment, setCustomDepartment] = useState("");

  // Departments for the selected faculty
  const activeFaculty = FALLBACK_FACULTIES.find((f) => String(f.id) === selectedFacultyId);
  const deptOptions = activeFaculty?.departments?.filter((d) => d.isActive) ?? [];

  const totalSteps = 3;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Please enter your full name"); return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address"); return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long"); return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match"); return false;
    }
    if (formData.phoneNumber.trim() && !isValidPhone(formData.phoneNumber)) {
      setError("Please enter a valid phone number"); return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (formData.accountType === "student") {
      const uniVal = formData.universityName === "Other" ? customUniversity.trim() : formData.universityName;
      if (!uniVal) { setError("Please select or enter your university"); return false; }
      const deptVal = selectedDeptName === "Other" ? customDepartment.trim() : selectedDeptName;
      if (!deptVal) { setError("Please select or enter your department"); return false; }
      if (!hasLetters(deptVal)) { setError("Department must contain letters"); return false; }
      if (!formData.degreeOrCourse.trim()) { setError("Please enter your degree/course"); return false; }
      if (!hasLetters(formData.degreeOrCourse)) { setError("Degree/Course must contain letters, not just numbers"); return false; }
      if (formData.studyingArea.trim() && !hasLetters(formData.studyingArea)) {
        setError("Studying Area must contain letters, not just numbers"); return false;
      }
    }
    if (!agreedToTerms) { setError("Please agree to the terms and conditions"); return false; }
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && !validateStep1()) return;
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
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        roles: ["student"] as UserRole[],
        primaryRole: "student" as UserRole,
        phoneNumber: formData.phoneNumber || undefined,
        studentProfile:
          formData.accountType === "student"
            ? {
                universityName:
                  formData.universityName === "Other"
                    ? customUniversity.trim()
                    : formData.universityName,
                facultyId: selectedFacultyId && selectedFacultyId !== "Other"
                  ? Number(selectedFacultyId)
                  : undefined,
                department:
                  selectedDeptName === "Other"
                    ? customDepartment.trim()
                    : selectedDeptName,
                customUniversity:
                  formData.universityName === "Other" ? customUniversity.trim() : undefined,
                customFaculty:
                  selectedFacultyId === "Other" ? customFaculty.trim() : undefined,
                customDepartment:
                  selectedDeptName === "Other" ? customDepartment.trim() : undefined,
                degreeOrCourse: formData.degreeOrCourse,
                studyingArea: formData.studyingArea || undefined,
                currentYear: formData.currentYear,
                currentSemester: formData.currentSemester,
                phoneNumber: formData.phoneNumber || undefined,
              }
            : undefined,
      });

      if (result.success) {
        if (formData.accountType === "vendor") {
          router.push("/student/become-vendor");
        } else {
          const redirectPath =
            sessionStorage.getItem("redirectAfterLogin") || dashboardPath;
          sessionStorage.removeItem("redirectAfterLogin");
          router.push(redirectPath);
        }
      } else {
        setError(result.error || "Registration failed. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ["Account", "Type", "Confirm"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--soft)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 16px 60px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Brand mark */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}>
            <div
              style={{
                width: 48, height: 48, borderRadius: 12,
                background: "var(--brand)", color: "#fff",
                fontSize: 22, fontWeight: 900,
                display: "grid", placeItems: "center",
                margin: "0 auto 12px",
              }}
            >
              U
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.5px" }}>
              Uni<span style={{ color: "var(--brand)" }}>Hub</span>
            </div>
          </Link>
        </div>

        {/* Step progress bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  display: "grid", placeItems: "center",
                  fontSize: 13, fontWeight: 800,
                  background: s < step ? "var(--brand)" : s === step ? "var(--ink)" : "#fff",
                  color: s <= step ? "#fff" : "var(--muted)",
                  border: s > step ? "2px solid var(--line)" : "none",
                  transition: "all .2s",
                }}
              >
                {s < step ? (
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
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
                  style={{
                    width: 72, height: 2, margin: "0 2px",
                    background: s < step ? "var(--brand)" : "var(--line)",
                    transition: "background .2s",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step label row */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, padding: "0 4px" }}>
          {stepLabels.map((label, i) => (
            <span
              key={label}
              style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                color: i + 1 <= step ? "var(--brand-dark)" : "var(--muted)",
                flex: 1, textAlign: i === 0 ? "left" : i === 2 ? "right" : "center",
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Card */}
        <div
          className="auth-card"
          style={{
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: "32px 36px",
            boxShadow: "0 4px 24px rgba(0,0,0,.06)",
          }}
        >
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: "var(--ink)" }}>
            {step === 1 && "Create your account"}
            {step === 2 && "Choose account type"}
            {step === 3 && formData.accountType === "student" && "Complete student profile"}
            {step === 3 && formData.accountType === "vendor" && "Review & create account"}
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--muted)" }}>
            {step === 1 && "Enter your basic information to get started"}
            {step === 2 && "Select whether you're a student or vendor"}
            {step === 3 && formData.accountType === "student" && "Tell us about your university studies"}
            {step === 3 && formData.accountType === "vendor" && "You'll set up your shop after registration"}
          </p>

          {error && (
            <div
              style={{
                marginBottom: 20, padding: "12px 14px",
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 8, fontSize: 13, color: "#b91c1c",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={
              step === totalSteps
                ? handleSubmit
                : (e) => { e.preventDefault(); handleNext(); }
            }
          >
            {/* ── Step 1 ── */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="reg-2col-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="First name">
                    <input
                      name="firstName" type="text" required
                      value={formData.firstName} onChange={handleChange}
                      placeholder="Kamal" style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                    />
                  </Field>
                  <Field label="Last name">
                    <input
                      name="lastName" type="text" required
                      value={formData.lastName} onChange={handleChange}
                      placeholder="Perera" style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                    />
                  </Field>
                </div>

                <Field label="Email address">
                  <input
                    name="email" type="email" autoComplete="email" required
                    value={formData.email} onChange={handleChange}
                    placeholder="you@example.com" style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                  />
                </Field>

                <Field label="Phone number" optional>
                  <input
                    name="phoneNumber" type="tel"
                    value={formData.phoneNumber} onChange={handleChange}
                    placeholder="+94 77 123 4567" style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                  />
                </Field>

                <Field label="Password">
                  <div style={{ position: "relative" }}>
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password" required
                      value={formData.password} onChange={handleChange}
                      placeholder="Min. 8 characters"
                      style={{ ...inputStyle, padding: "0 44px 0 14px" }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                    />
                    <button
                      type="button" tabIndex={-1}
                      onClick={() => setShowPassword((p) => !p)}
                      style={{
                        position: "absolute", right: 12, top: "50%",
                        transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        padding: 0, color: "var(--muted)", display: "flex", lineHeight: 1,
                      }}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </Field>

                <Field label="Confirm password">
                  <input
                    name="confirmPassword" type="password"
                    autoComplete="new-password" required
                    value={formData.confirmPassword} onChange={handleChange}
                    placeholder="••••••••" style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                  />
                </Field>
              </div>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(
                  [
                    {
                      type: "student" as const,
                      title: "Student",
                      desc: "I'm a university student looking to learn, attend kuppi sessions, and shop on the marketplace",
                      bullets: [
                        "Enroll in courses and kuppi sessions",
                        "Buy and sell on marketplace",
                        "Can become a tutor later (with approval)",
                      ],
                    },
                    {
                      type: "vendor" as const,
                      title: "Vendor",
                      desc: "I want to sell products on the UniHub marketplace",
                      bullets: [
                        "Create and manage shop listings",
                        "Manage orders and inventory",
                        "Access vendor dashboard and analytics",
                      ],
                    },
                  ] as const
                ).map(({ type, title, desc, bullets }) => {
                  const selected = formData.accountType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => { setFormData((p) => ({ ...p, accountType: type })); setError(null); }}
                      style={{
                        width: "100%", textAlign: "left",
                        padding: "18px 20px",
                        border: selected ? "2px solid var(--brand)" : "2px solid var(--line)",
                        borderRadius: 10,
                        background: selected ? "#f0fdf9" : "#fff",
                        cursor: "pointer", transition: "all .15s",
                        display: "flex", alignItems: "flex-start", gap: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 20, height: 20, borderRadius: "50%",
                          flexShrink: 0, marginTop: 2,
                          background: selected ? "var(--brand)" : "#fff",
                          border: selected ? "6px solid var(--brand)" : "2px solid var(--line)",
                          transition: "all .15s",
                        }}
                      />
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>
                          {title}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8, lineHeight: 1.5 }}>
                          {desc}
                        </div>
                        <ul style={{ margin: 0, padding: "0 0 0 16px", listStyle: "disc" }}>
                          {bullets.map((b) => (
                            <li key={b} style={{ fontSize: 12, color: "var(--muted)", marginBottom: 2 }}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Step 3 ── */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {formData.accountType === "student" ? (
                  <>
                    {/* University */}
                    <Field label="University">
                      <select
                        name="universityName" required
                        value={formData.universityName} onChange={handleChange}
                        style={{ ...inputStyle, cursor: "pointer" }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                      >
                        <option value="">Select your university</option>
                        {UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </Field>
                    {formData.universityName === "Other" && (
                      <Field label="Your university name">
                        <input
                          type="text" required
                          value={customUniversity} onChange={(e) => setCustomUniversity(e.target.value)}
                          placeholder="Enter your university name" style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                          onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                        />
                        <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--muted)" }}>
                          We&apos;ll add it to our list — thanks for letting us know!
                        </p>
                      </Field>
                    )}

                    {/* Faculty */}
                    <Field label="Faculty">
                      <select
                        value={selectedFacultyId}
                        onChange={(e) => {
                          setSelectedFacultyId(e.target.value);
                          setSelectedDeptName("");
                          setCustomFaculty("");
                          setCustomDepartment("");
                        }}
                        style={{ ...inputStyle, cursor: "pointer" }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                      >
                        <option value="">Select your faculty</option>
                        {FALLBACK_FACULTIES.map((f) => (
                          <option key={f.id} value={String(f.id)}>{f.name}</option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                    </Field>
                    {selectedFacultyId === "Other" && (
                      <Field label="Your faculty name">
                        <input
                          type="text"
                          value={customFaculty} onChange={(e) => setCustomFaculty(e.target.value)}
                          placeholder="e.g. Faculty of Veterinary Science" style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                          onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                        />
                        <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--muted)" }}>
                          We&apos;ll review and add it — thanks!
                        </p>
                      </Field>
                    )}

                    {/* Department + Degree */}
                    <div className="reg-2col-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <Field label="Department">
                        {selectedFacultyId && selectedFacultyId !== "Other" && deptOptions.length > 0 ? (
                          <select
                            value={selectedDeptName}
                            onChange={(e) => { setSelectedDeptName(e.target.value); setCustomDepartment(""); }}
                            style={{ ...inputStyle, cursor: "pointer" }}
                            onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                            onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                          >
                            <option value="">Select department</option>
                            {deptOptions.map((d) => (
                              <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                            <option value="Other">Other</option>
                          </select>
                        ) : (
                          <input
                            type="text" required
                            value={selectedDeptName}
                            onChange={(e) => setSelectedDeptName(e.target.value)}
                            placeholder="e.g. Computer Science" style={inputStyle}
                            onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                            onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                          />
                        )}
                      </Field>
                      <Field label="Degree / Course">
                        <input
                          name="degreeOrCourse" type="text" required
                          value={formData.degreeOrCourse} onChange={handleChange}
                          placeholder="BSc (Hons)" style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                          onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                        />
                      </Field>
                    </div>
                    {selectedDeptName === "Other" && (
                      <Field label="Your department name">
                        <input
                          type="text"
                          value={customDepartment} onChange={(e) => setCustomDepartment(e.target.value)}
                          placeholder="e.g. Biomedical Engineering" style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                          onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                        />
                        <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--muted)" }}>
                          We&apos;ll review and add it — thanks!
                        </p>
                      </Field>
                    )}

                    <Field label="Studying area" optional>
                      <input
                        name="studyingArea" type="text"
                        value={formData.studyingArea} onChange={handleChange}
                        placeholder="Software Engineering" style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                      />
                    </Field>

                    <div className="reg-2col-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <Field label="Current year">
                        <select
                          name="currentYear"
                          value={formData.currentYear} onChange={handleChange}
                          style={{ ...inputStyle, cursor: "pointer" }}
                          onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                          onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                        >
                          {[1, 2, 3, 4, 5, 6].map((y) => (
                            <option key={y} value={y}>Year {y}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Current semester">
                        <select
                          name="currentSemester"
                          value={formData.currentSemester} onChange={handleChange}
                          style={{ ...inputStyle, cursor: "pointer" }}
                          onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                          onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                        >
                          <option value={1}>Semester 1</option>
                          <option value={2}>Semester 2</option>
                        </select>
                      </Field>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      padding: 24, borderRadius: 8,
                      border: "1px solid var(--line)", background: "var(--soft)",
                      textAlign: "center", fontSize: 14, color: "var(--muted)", lineHeight: 1.6,
                    }}
                  >
                    Complete your registration and we&apos;ll guide you through shop setup.
                  </div>
                )}

                {/* Terms */}
                <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    style={{ marginTop: 3, width: 16, height: 16, accentColor: "var(--brand)", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
                    I agree to the{" "}
                    <Link href="/terms" style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" style={{ color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              {step > 1 && (
                <button
                  type="button" onClick={handleBack}
                  style={{
                    flex: 1, height: 46,
                    background: "#fff", border: "1.5px solid var(--line)",
                    borderRadius: 7, fontSize: 14, fontWeight: 700,
                    color: "var(--ink)", cursor: "pointer", transition: "border-color .15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--ink)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1, height: 46,
                  background: loading ? "#94a3b8" : "var(--ink)",
                  color: "#fff", border: "none", borderRadius: 7,
                  fontSize: 14, fontWeight: 800,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background .15s",
                }}
              >
                {loading ? (
                  <>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ animation: "auth-spin 0.8s linear infinite" }}
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Creating account…
                  </>
                ) : step === totalSteps ? "Create account" : "Continue"}
              </button>
            </div>
          </form>
        </div>

        {/* Login link */}
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "var(--brand)", fontWeight: 700, textDecoration: "none" }}>
            Log in
          </Link>
        </p>
      </div>

      <style jsx global>{`
        @keyframes auth-spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) {
          .auth-card { padding: 20px 16px !important; }
          .reg-2col-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
