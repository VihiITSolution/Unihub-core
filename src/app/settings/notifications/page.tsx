"use client";

import { useState, useEffect } from "react";

interface Prefs {
  courseUpdates: boolean;
  newEnrollment: boolean;
  sessionReminders: boolean;
  marketplaceMessages: boolean;
  boardingMessages: boolean;
  promotions: boolean;
  weeklyDigest: boolean;
}

const DEFAULTS: Prefs = {
  courseUpdates: true,
  newEnrollment: true,
  sessionReminders: true,
  marketplaceMessages: true,
  boardingMessages: true,
  promotions: false,
  weeklyDigest: true,
};

const GROUPS = [
  {
    title: "Learning",
    items: [
      { key: "courseUpdates" as keyof Prefs, label: "Course updates", desc: "When a tutor adds new lessons or materials to a course you're enrolled in" },
      { key: "sessionReminders" as keyof Prefs, label: "Live session reminders", desc: "Reminder 1 hour before a booked live kuppi session" },
    ],
  },
  {
    title: "Teaching",
    items: [
      { key: "newEnrollment" as keyof Prefs, label: "New student enrolled", desc: "When someone enrols in one of your courses" },
    ],
  },
  {
    title: "Marketplace & Boarding",
    items: [
      { key: "marketplaceMessages" as keyof Prefs, label: "Marketplace messages", desc: "Messages from buyers or sellers on your listings" },
      { key: "boardingMessages" as keyof Prefs, label: "Boarding enquiries", desc: "New messages or offers on your saved boarding rooms" },
    ],
  },
  {
    title: "General",
    items: [
      { key: "weeklyDigest" as keyof Prefs, label: "Weekly digest", desc: "A weekly summary of your activity and recommended content" },
      { key: "promotions" as keyof Prefs, label: "Promotions & offers", desc: "Discounts, feature announcements, and special events" },
    ],
  },
];

const STORAGE_KEY = "unihub_notif_prefs";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${checked ? "bg-blue-600" : "bg-gray-200"}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPrefs({ ...DEFAULTS, ...JSON.parse(stored) });
    } catch {}
  }, []);

  const set = (key: keyof Prefs, val: boolean) => {
    setPrefs(p => ({ ...p, [key]: val }));
    setSaved(false);
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-4">
      {GROUPS.map(group => (
        <div key={group.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{group.title}</h3>
          <div className="space-y-5">
            {group.items.map(({ key, label, desc }) => (
              <div key={key} className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <Toggle checked={prefs[key]} onChange={v => set(key, v)} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Preferences are saved to this device.</p>
        <button onClick={save} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          {saved ? "Saved!" : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
