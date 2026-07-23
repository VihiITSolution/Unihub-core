"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/constants";

export default function DangerZone() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm !== "DELETE") {
      setError('Please type DELETE to confirm.');
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/account`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        logout();
        router.push("/auth/login?deleted=1");
      } else {
        setError(data.message || "Failed to delete account.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Warning banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-800 mb-1">This action cannot be undone</h3>
            <p className="text-sm text-red-700">
              Deleting your account will permanently remove your profile, course history, and all data. This cannot be reversed.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Delete Account</h2>

        <ul className="text-sm text-gray-600 space-y-2 mb-6">
          {[
            "Your profile and account details will be permanently removed",
            "Your courses and enrolled content will no longer be accessible",
            "Active subscriptions or marketplace listings will be cancelled",
            "You will not be able to recover your data after deletion",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
              {item}
            </li>
          ))}
        </ul>

        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            I want to delete my account
          </button>
        ) : (
          <form onSubmit={handleDelete} className="space-y-4 max-w-md">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm with your password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your current password"
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="DELETE"
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={deleting || confirm !== "DELETE"}
                className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? "Deleting…" : "Delete My Account"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setPassword(""); setConfirm(""); setError(null); }}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
