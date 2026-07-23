"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";

function Alert({ type, text }: { type: "success" | "error"; text: string }) {
  return (
    <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
      {text}
    </div>
  );
}

export default function SecuritySettings() {
  const { token } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (form.newPassword.length < 8) { setMsg({ type: "error", text: "New password must be at least 8 characters" }); return; }
    if (form.newPassword !== form.confirmPassword) { setMsg({ type: "error", text: "Passwords do not match" }); return; }
    setSaving(true);
    setMsg(null);
    try {
      const res = await authService.changePassword(token, form.currentPassword, form.newPassword);
      if (res.success) {
        setMsg({ type: "success", text: "Password changed successfully!" });
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMsg({ type: "error", text: res.message || "Failed to change password" });
      }
    } catch {
      setMsg({ type: "error", text: "Something went wrong. Try again." });
    } finally {
      setSaving(false);
    }
  };

  const PasswordField = ({ id, label, value, showKey }: { id: keyof typeof form; label: string; showKey: keyof typeof show; value: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show[showKey] ? "text" : "password"}
          value={value}
          onChange={e => setForm(p => ({ ...p, [id]: e.target.value }))}
          required
          className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button type="button" onClick={() => setShow(p => ({ ...p, [showKey]: !p[showKey] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
          {show[showKey] ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Change Password</h2>
      <p className="text-sm text-gray-500 mb-6">Use a strong password — at least 8 characters with a mix of letters and numbers.</p>
      {msg && <Alert {...msg} />}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <PasswordField id="currentPassword" label="Current Password" showKey="current" value={form.currentPassword} />
        <PasswordField id="newPassword" label="New Password" showKey="new" value={form.newPassword} />
        <PasswordField id="confirmPassword" label="Confirm New Password" showKey="confirm" value={form.confirmPassword} />

        <div className="pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Changing…" : "Change Password"}
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Active Sessions</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-gray-800">Current session</p>
            <p className="text-xs text-gray-400 mt-0.5">This device · Active now</p>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Active</span>
        </div>
      </div>
    </div>
  );
}
