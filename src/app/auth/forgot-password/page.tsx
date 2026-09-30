"use client";

import { useState } from "react";
import Link from "next/link";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authService.forgotPassword(email.trim());
      if (response.success) {
        setSubmitted(true);
      } else {
        setError(response.message || "Something went wrong. Please try again.");
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
            Forgot your password?
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--muted)" }}>
            Enter your email address and we&apos;ll help you reset it.
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

          {submitted ? (
            <div>
              <div
                style={{
                  padding: "12px 14px",
                  background: "#f0fdf9",
                  border: "1px solid var(--brand)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "var(--ink)",
                  marginBottom: 16,
                }}
              >
                If an account with that email exists, a six-digit password
                reset code has been sent.
              </div>
              <Link
                href={`/auth/reset-password?email=${encodeURIComponent(email.trim())}`}
                style={{ color: "var(--brand)", fontWeight: 700 }}
              >
                Enter your reset code
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                  Email address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="you@example.com"
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
                {loading ? "Sending…" : "Send reset code"}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--muted)" }}>
          Remembered your password?{" "}
          <Link href="/auth/login" style={{ color: "var(--brand)", fontWeight: 700, textDecoration: "none" }}>
            Log in
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
