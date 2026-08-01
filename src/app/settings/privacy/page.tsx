"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/constants";

interface Privacy {
  profileVisible: boolean;
  showEnrollments: boolean;
  showCourses: boolean;
  allowFollowers: boolean;
  showActivity: boolean;
}

const DEFAULTS: Privacy = {
  profileVisible: true,
  showEnrollments: false,
  showCourses: true,
  allowFollowers: true,
  showActivity: false,
};

const STORAGE_KEY = "unihub_privacy_prefs";

const ITEMS: { key: keyof Privacy; label: string; desc: string }[] = [
  { key: "profileVisible",   label: "Public profile",         desc: "Allow anyone to view your profile page" },
  { key: "showCourses",      label: "Show my courses",        desc: "Display courses you've published on your profile" },
  { key: "showEnrollments",  label: "Show enrolled courses",  desc: "Let others see which courses you're taking" },
  { key: "allowFollowers",   label: "Allow followers",        desc: "Let other users follow you on the wall" },
  { key: "showActivity",     label: "Show wall activity",     desc: "Display your wall posts on your public profile" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${checked ? "bg-blue-600" : "bg-gray-200"}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export default function PrivacySettings() {
  const { token } = useAuth();
  const [prefs, setPrefs] = useState<Privacy>(DEFAULTS);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Load: API first (if authenticated), fall back to localStorage
  useEffect(() => {
    const localRaw = localStorage.getItem(STORAGE_KEY);
    const localPrefs = localRaw ? { ...DEFAULTS, ...JSON.parse(localRaw) } : null;

    if (!token) {
      if (localPrefs) setPrefs(localPrefs);
      return;
    }

    fetch(`${API_BASE_URL}/profile/preferences`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.privacyPrefs) {
          const merged = { ...DEFAULTS, ...data.data.privacyPrefs };
          setPrefs(merged);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } else if (localPrefs) {
          setPrefs(localPrefs);
        }
      })
      .catch(() => {
        if (localPrefs) setPrefs(localPrefs);
      });
  }, [token]);

  const set = (key: keyof Privacy, val: boolean) => {
    setPrefs((p) => ({ ...p, [key]: val }));
    setStatus("idle");
  };

  const save = async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

    if (!token) {
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
      return;
    }

    setStatus("saving");
    try {
      const res = await fetch(`${API_BASE_URL}/profile/preferences`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: "privacy", prefs }),
      });
      const data = await res.json();
      setStatus(data.success ? "saved" : "error");
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 2500);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Privacy Settings</h2>
        <p className="text-sm text-gray-500 mb-6">Control who can see your profile and activity on UniHub.</p>
        <div className="space-y-5">
          {ITEMS.map(({ key, label, desc }) => (
            <div key={key} className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-gray-50 last:border-0 last:pb-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <Toggle checked={prefs[key]} onChange={(v) => set(key, v)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {token ? "Settings synced to your account." : "Sign in to sync across devices."}
        </p>
        <button
          onClick={save}
          disabled={status === "saving"}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved!" : status === "error" ? "Error — retry" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
