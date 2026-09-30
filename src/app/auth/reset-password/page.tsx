"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  height: 44,
  padding: "0 14px",
  border: "1px solid var(--line)",
  borderRadius: 7,
  fontSize: 14,
  color: "var(--ink)",
  background: "#fff",
  outline: "none",
  transition: "border-color .15s",
};

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Request a reset code from the forgot-password page first.");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the six-digit code sent to your email.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.resetPassword(email, code, newPassword);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => router.push("/auth/login"), 2000);
      } else {
        setError(response.message || "Failed to reset password. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--soft)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "var(--brand)",
                color: "#fff",
                fontSize: 22,
                fontWeight: 900,
                display: "grid",
                placeItems: "center",
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
            Reset your password
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--muted)" }}>
            Enter the six-digit code sent to your email and choose a new password.
          </p>

          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: "12px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                fontSize: 13,
                color: "#b91c1c",
              }}
            >
              {error}
            </div>
          )}

          {success ? (
            <div
              style={{
                padding: "12px 14px",
                background: "#f0fdf9",
                border: "1px solid var(--brand)",
                borderRadius: 8,
                fontSize: 13,
                color: "var(--ink)",
              }}
            >
              Password reset successfully. Redirecting you to log in…
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                  Email reset code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ""));
                    setError(null);
                  }}
                  placeholder="123456"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                  New password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Min. 8 characters"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                  Confirm new password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 46,
                  background: loading ? "#94a3b8" : "var(--ink)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 7,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Resetting…" : "Reset password"}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--muted)" }}>
          <Link href="/auth/login" style={{ color: "var(--brand)", fontWeight: 700, textDecoration: "none" }}>
            Back to log in
          </Link>
        </p>
      </div>
      <style jsx global>{`
        @media (max-width: 480px) {
          .auth-card { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
