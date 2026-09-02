"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { liveSessionService } from "@/services/live-session.service";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Loading } from "@/components/ui";
import type { CreateLiveSessionData } from "@/types";
import { TOKEN_KEY } from "@/lib/constants";

const colomboToUtc = (value: string) =>
  new Date(`${value.length === 16 ? value + ":00" : value}+05:30`).toISOString();

export default function CreateLiveSessionPage() {
  const router = useRouter();
  const { isChecking } = useRoleCheck({ requiredRole: "tutor", requireApproval: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<CreateLiveSessionData>({
    title: "", description: "", scheduledStartTime: "", scheduledEndTime: "",
    isFree: true, price: 0, maxAttendees: undefined, allowRecording: true,
    tags: [], teamsEmail: "",
  });

  const change = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    const next = type === "checkbox" ? (event.target as HTMLInputElement).checked
      : name === "maxAttendees" ? (value ? Number(value) : undefined)
      : name === "tags" ? value.split(",").map((tag) => tag.trim()).filter(Boolean)
      : value;
    setForm((current) => ({ ...current, [name]: next }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error("Please log in to request a session");
      await liveSessionService.createSession({
        ...form,
        scheduledStartTime: colomboToUtc(form.scheduledStartTime),
        scheduledEndTime: colomboToUtc(form.scheduledEndTime),
        isFree: true,
        price: 0,
      }, token);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit live-session request");
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) return <div className="min-h-[50vh] flex items-center justify-center"><Loading /></div>;
  if (submitted) return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="rounded-xl border border-green-200 bg-green-50 p-8">
        <h1 className="text-2xl font-bold text-green-900">Request submitted</h1>
        <p className="mt-3 text-green-800">An administrator will approve the schedule after your Microsoft invitation is accepted. You no longer need OBS or a stream key.</p>
        <button onClick={() => router.push("/tutor/live-sessions")} className="mt-6 rounded-lg bg-green-700 px-5 py-2.5 text-white">View my sessions</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold">Request a Teams live session</h1>
      <p className="mt-2 text-gray-600">Times are entered in Asia/Colombo. All sessions are free during this rollout.</p>
      {error && <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      <form onSubmit={submit} className="mt-6 space-y-5 rounded-xl bg-white p-6 shadow">
        <label className="block">
          <span className="text-sm font-medium">Session title</span>
          <input name="title" required value={form.title} onChange={change} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Description</span>
          <textarea name="description" rows={4} value={form.description} onChange={change} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Your Microsoft Teams email</span>
          <input name="teamsEmail" type="email" required value={form.teamsEmail} onChange={change} className="mt-1 w-full rounded-lg border px-3 py-2" />
          <span className="mt-1 block text-xs text-gray-500">We will invite this account into UniHub&apos;s Microsoft tenant. Accept that invitation before admin approval.</span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="text-sm font-medium">Starts (Colombo)</span><input name="scheduledStartTime" type="datetime-local" required value={form.scheduledStartTime} onChange={change} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
          <label><span className="text-sm font-medium">Ends (Colombo)</span><input name="scheduledEndTime" type="datetime-local" required value={form.scheduledEndTime} onChange={change} className="mt-1 w-full rounded-lg border px-3 py-2" /></label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="text-sm font-medium">Maximum attendees</span><input name="maxAttendees" type="number" min={1} value={form.maxAttendees || ""} onChange={change} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="No limit" /></label>
          <label><span className="text-sm font-medium">Tags</span><input name="tags" value={form.tags?.join(", ") || ""} onChange={change} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="math, revision" /></label>
        </div>
        <label className="flex items-center gap-2"><input name="allowRecording" type="checkbox" checked={form.allowRecording} onChange={change} /><span className="text-sm">Automatically record this session</span></label>
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">Microsoft sign-in is required for tutors and students. The organizer account is shared, so approved sessions must have a 15-minute buffer.</div>
        <button disabled={loading} className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white disabled:opacity-50">{loading ? "Submitting..." : "Submit for approval"}</button>
      </form>
    </div>
  );
}
