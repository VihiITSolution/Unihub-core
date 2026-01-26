"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useDashboardPath } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const dashboardPath = useDashboardPath();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin') || dashboardPath;
      sessionStorage.removeItem('redirectAfterLogin');
      router.push(redirectPath);
    }
  }, [isAuthenticated, dashboardPath, router]);

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
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || dashboardPath;
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);
      } else {
        setError(result.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-ocean-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white">
              Uni<span className="text-amber-500">Hub</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">LEARN. EARN. GROW.</p>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-navy-900/50 backdrop-blur-lg rounded-2xl p-8 border border-navy-800 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400 mb-6">Sign in to continue your journey</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-navy-800 border border-navy-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-ocean-500 focus:ring-ocean-500 border-navy-600 rounded bg-navy-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                  Remember me
                </label>
              </div>

              <Link
                href="/auth/forgot-password"
                className="text-sm text-ocean-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}
