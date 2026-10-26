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
const FIELD_CLASS = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100";

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
    if (form.scheduledEndTime <= form.scheduledStartTime) {
      setError("Choose an end time that is after the session start time.");
      return;
    }
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
    <div className="container-custom max-w-2xl py-8 sm:py-12">
      <div className="rounded-xl border border-green-200 bg-green-50 p-8">
        <h1 className="text-2xl font-bold text-green-900">Request submitted</h1>
        <p className="mt-3 text-green-800">An administrator will approve the schedule after your Microsoft invitation is accepted. You no longer need OBS or a stream key.</p>
        <button type="button" onClick={() => router.push("/tutor/live-sessions")} className="mt-6 rounded-lg bg-green-700 px-5 py-2.5 text-white">View my sessions</button>
      </div>
    </div>
  );

  return (
    <div className="container-custom max-w-3xl py-8 sm:py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">Teams live session</span>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-950">Request a live session</h1>
        <p className="mt-2 text-slate-600">Choose a time in Asia/Colombo. Sessions are free during this rollout and require admin approval.</p>
      </div>
      {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
      <form onSubmit={submit} className="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="border-b border-slate-200 pb-5">
          <h2 className="text-lg font-bold text-slate-900">Session details</h2>
          <p className="mt-1 text-sm text-slate-600">Please allow a 15-minute buffer between sessions using the shared organiser.</p>
        </div>
        <label className="block">
          <span className="text-sm font-medium">Session title</span>
          <input name="title" required value={form.title} onChange={change} className={FIELD_CLASS} placeholder="e.g. Calculus revision workshop" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Description</span>
          <textarea name="description" rows={4} value={form.description} onChange={change} className={FIELD_CLASS} placeholder="What will students cover in this session?" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Your Microsoft Teams email</span>
          <input name="teamsEmail" type="email" required value={form.teamsEmail} onChange={change} className={FIELD_CLASS} placeholder="name@outlook.com" />
          <span className="mt-1 block text-xs text-gray-500">We will invite this account into UniHub&apos;s Microsoft tenant. Accept that invitation before admin approval.</span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="text-sm font-medium">Starts (Colombo)</span><input name="scheduledStartTime" type="datetime-local" required value={form.scheduledStartTime} onChange={change} className={FIELD_CLASS} /></label>
          <label><span className="text-sm font-medium">Ends (Colombo)</span><input name="scheduledEndTime" type="datetime-local" required value={form.scheduledEndTime} onChange={change} className={FIELD_CLASS} /></label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="text-sm font-medium">Maximum attendees</span><input name="maxAttendees" type="number" min={1} value={form.maxAttendees || ""} onChange={change} className={FIELD_CLASS} placeholder="No limit" /></label>
          <label><span className="text-sm font-medium">Tags</span><input name="tags" value={form.tags?.join(", ") || ""} onChange={change} className={FIELD_CLASS} placeholder="math, revision" /></label>
        </div>
        <label className="flex items-center gap-2"><input name="allowRecording" type="checkbox" checked={form.allowRecording} onChange={change} /><span className="text-sm">Automatically record this session</span></label>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">Microsoft sign-in is required for tutors and students. The organiser account is shared, so approved sessions need a 15-minute buffer.</div>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => router.back()} disabled={loading} className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
          <button type="submit" disabled={loading} className="rounded-lg bg-emerald-700 px-6 py-2.5 font-medium text-white hover:bg-emerald-800 disabled:opacity-50">{loading ? "Submitting..." : "Submit for approval"}</button>
        </div>
      </form>
    </div>
  );
}
