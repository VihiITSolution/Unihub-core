"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useDashboardPath } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const dashboardPath = useDashboardPath();
  const hasRedirected = useRef(false);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !authLoading && !hasRedirected.current) {
      hasRedirected.current = true;
      const redirectPath = sessionStorage.getItem("redirectAfterLogin") || dashboardPath;
      sessionStorage.removeItem("redirectAfterLogin");
      router.replace(redirectPath);
    }
  }, [isAuthenticated, authLoading, dashboardPath, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login({ email: formData.email, password: formData.password });

      if (result.success) {
        hasRedirected.current = true;
        const redirectPath = sessionStorage.getItem("redirectAfterLogin") || dashboardPath;
        sessionStorage.removeItem("redirectAfterLogin");
        router.replace(redirectPath);
      } else {
        setError(result.error || "Login failed. Please check your credentials.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--soft)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Brand mark */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "var(--brand)", color: "#fff",
              fontSize: 22, fontWeight: 900,
              display: "grid", placeItems: "center",
              margin: "0 auto 12px",
            }}>
              U
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--ink)", letterSpacing: "-0.5px" }}>
              Uni<span style={{ color: "var(--brand)" }}>Hub</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.1em", marginTop: 2 }}>
              LEARN. EARN. GROW.
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="auth-card" style={{
          background: "#fff",
          border: "1px solid var(--line)",
          borderRadius: 12,
          padding: "32px 36px",
          boxShadow: "0 4px 24px rgba(0,0,0,.06)",
        }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 900, color: "var(--ink)" }}>
            Welcome back
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--muted)" }}>
            Log in to continue your journey
          </p>

          {error && (
            <div style={{
              marginBottom: 20,
              padding: "12px 14px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 8,
              fontSize: 13,
              color: "#b91c1c",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                Email address
              </label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{
                  width: "100%", boxSizing: "border-box",
                  height: 44, padding: "0 14px",
                  border: "1px solid var(--line)", borderRadius: 7,
                  fontSize: 14, color: "var(--ink)",
                  background: "#fff", outline: "none",
                  transition: "border-color .15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                  Password
                </label>
                <Link href="/auth/forgot-password" style={{ fontSize: 12, color: "var(--brand)", textDecoration: "none", fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    height: 44, padding: "0 44px 0 14px",
                    border: "1px solid var(--line)", borderRadius: 7,
                    fontSize: 14, color: "var(--ink)",
                    background: "#fff", outline: "none",
                    transition: "border-color .15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  tabIndex={-1}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    color: "var(--muted)", display: "flex", lineHeight: 1,
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", height: 46, marginTop: 4,
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ animation: "auth-spin 0.8s linear infinite" }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Signing in…
                </>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "24px 0 20px" }}>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span style={{ margin: "0 12px", fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>

          <p style={{ margin: 0, textAlign: "center", fontSize: 14, color: "var(--muted)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" style={{ color: "var(--brand)", fontWeight: 700, textDecoration: "none" }}>
              Sign up free
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "var(--muted)" }}>
          By continuing you agree to our{" "}
          <Link href="/terms" style={{ color: "var(--brand)", textDecoration: "none" }}>Terms</Link>{" "}
          &amp;{" "}
          <Link href="/privacy" style={{ color: "var(--brand)", textDecoration: "none" }}>Privacy Policy</Link>.
        </p>
      </div>

      <style jsx global>{`
        @keyframes auth-spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) {
          .auth-card { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
}
