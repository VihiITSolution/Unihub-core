"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { liveSessionService } from "@/services/live-session.service";
import { TOKEN_KEY } from "@/lib/constants";

const utcToColomboInput = (value: string) => {
  const date = new Date(new Date(value).getTime() + 330 * 60_000);
  return date.toISOString().slice(0, 16);
};
const colomboToUtc = (value: string) => new Date(`${value}:00+05:30`).toISOString();

export default function EditLiveSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", scheduledStartTime: "", scheduledEndTime: "", allowRecording: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) throw new Error("Please log in");
        const response = await liveSessionService.getMySessions(token);
        const session = response.data.sessions.find((item) => String(item.id) === id);
        if (!session) throw new Error("Session not found");
        setForm({
          title: session.title, description: session.description || "",
          scheduledStartTime: utcToColomboInput(session.scheduledStartTime),
          scheduledEndTime: utcToColomboInput(session.scheduledEndTime),
          allowRecording: session.allowRecording,
        });
      } catch (err: any) { setError(err.message || "Failed to load session"); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError(null);
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error("Please log in");
      await liveSessionService.updateSession(id, {
        ...form, teamsEmail: "", isFree: true, price: 0,
        scheduledStartTime: colomboToUtc(form.scheduledStartTime),
        scheduledEndTime: colomboToUtc(form.scheduledEndTime),
      }, token);
      router.push("/tutor/live-sessions");
    } catch (err: any) { setError(err.message || "Failed to update session"); setLoading(false); }
  };

  if (loading && !form.title) return <div className="p-10 text-center">Loading session…</div>;
  return <div className="mx-auto max-w-2xl p-6"><h1 className="text-3xl font-bold">Edit live session</h1><p className="mt-2 text-gray-600">Approved schedule changes are checked against the shared organizer and synchronized to Teams.</p>{error && <div className="mt-4 rounded bg-red-50 p-4 text-red-700">{error}</div>}<form onSubmit={submit} className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow"><label className="block"><span className="text-sm font-medium">Title</span><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label><label className="block"><span className="text-sm font-medium">Description</span><textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label><div className="grid gap-4 sm:grid-cols-2"><label><span className="text-sm font-medium">Starts (Colombo)</span><input type="datetime-local" required value={form.scheduledStartTime} onChange={(e) => setForm({ ...form, scheduledStartTime: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label><label><span className="text-sm font-medium">Ends (Colombo)</span><input type="datetime-local" required value={form.scheduledEndTime} onChange={(e) => setForm({ ...form, scheduledEndTime: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label></div><label className="flex gap-2"><input type="checkbox" checked={form.allowRecording} onChange={(e) => setForm({ ...form, allowRecording: e.target.checked })} /> Automatically record</label><button disabled={loading} className="rounded bg-blue-600 px-5 py-2.5 text-white disabled:opacity-50">{loading ? "Saving…" : "Save changes"}</button></form></div>;
}
