"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { liveSessionService, MeetingIdentity } from "@/services/live-session.service";
import type { LiveSession } from "@/types";
import { TOKEN_KEY } from "@/lib/constants";

export default function TutorLiveSessionsPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [identity, setIdentity] = useState<MeetingIdentity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) throw new Error("Please log in");
      const [sessionResponse, identityResponse] = await Promise.all([
        liveSessionService.getMySessions(token),
        liveSessionService.getMeetingIdentity(token),
      ]);
      setSessions(sessionResponse.data.sessions || []);
      setIdentity(identityResponse.data.identity);
    } catch (err: any) { setError(err.message || "Failed to load sessions"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const act = async (session: LiveSession, action: "start" | "end" | "cancel") => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      if (action === "cancel" && !confirm("Cancel this session?")) return;
      if (action === "end" && !confirm("Mark this session ended and import Teams artifacts?")) return;
      const response = action === "start"
        ? await liveSessionService.startSession(session.id, token)
        : action === "end"
          ? await liveSessionService.endSession(session.id, token)
          : await liveSessionService.cancelSession(session.id, token);
      const joinUrl = (response as any).data?.joinUrl;
      if (joinUrl) window.open(joinUrl, "_blank", "noopener,noreferrer");
      await load();
    } catch (err: any) { setError(err.message || `Failed to ${action} session`); }
  };

  if (loading) return <div className="p-10 text-center">Loading live sessions…</div>;
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-bold">My live sessions</h1><p className="mt-1 text-gray-600">Teams requests, approvals, and attendance in one place.</p></div>
        <Link href="/tutor/live-sessions/create" className="rounded-lg bg-blue-600 px-5 py-2.5 text-white">Request session</Link>
      </div>
      {identity && <div className={`mt-5 rounded-lg border p-4 ${identity.invitationStatus === "accepted" ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>Microsoft identity: <strong>{identity.email}</strong> · {identity.invitationStatus}{identity.invitationRedeemUrl && identity.invitationStatus !== "accepted" && <a className="ml-3 underline" href={identity.invitationRedeemUrl} target="_blank" rel="noreferrer">Accept invitation</a>}</div>}
      {error && <div className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}
      <div className="mt-6 space-y-4">
        {sessions.length === 0 && <div className="rounded-xl bg-gray-50 p-10 text-center text-gray-600">No live-session requests yet.</div>}
        {sessions.map((session) => (
          <article key={session.id} className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{session.title}</h2>
                <p className="mt-1 text-gray-600">{session.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-gray-100 px-3 py-1">{session.provider.toUpperCase()}</span>
                  <span className="rounded-full bg-blue-100 px-3 py-1">Approval: {session.approvalStatus}</span>
                  <span className="rounded-full bg-purple-100 px-3 py-1">Provider: {session.providerStatus}</span>
                  <span className="rounded-full bg-green-100 px-3 py-1">Session: {session.status}</span>
                </div>
                <p className="mt-3 text-sm text-gray-500">{new Date(session.scheduledStartTime).toLocaleString("en-LK", { timeZone: "Asia/Colombo" })} – {new Date(session.scheduledEndTime).toLocaleTimeString("en-LK", { timeZone: "Asia/Colombo" })}</p>
                {session.rejectionReason && <p className="mt-2 text-sm text-red-700">Changes requested: {session.rejectionReason}</p>}
              </div>
              <div className="flex flex-wrap items-start gap-2">
                {session.status === "scheduled" && session.approvalStatus === "approved" && session.providerStatus === "ready" && <button onClick={() => act(session, "start")} className="rounded bg-green-600 px-4 py-2 text-white">Start in Teams</button>}
                {session.status === "scheduled" && <Link href={`/tutor/live-sessions/${session.id}/edit`} className="rounded border px-4 py-2">Reschedule</Link>}
                {session.status === "live" && <button onClick={() => act(session, "end")} className="rounded bg-red-600 px-4 py-2 text-white">End</button>}
                {session.status === "scheduled" && <button onClick={() => act(session, "cancel")} className="rounded border border-red-300 px-4 py-2 text-red-700">Cancel</button>}
                {session.recordingUrl && <a href={session.recordingUrl} target="_blank" rel="noreferrer" className="rounded bg-purple-600 px-4 py-2 text-white">Recording</a>}
                <Link href={`/tutor/live-sessions/${session.id}/enrollments`} className="rounded bg-gray-100 px-4 py-2">Enrollments</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
