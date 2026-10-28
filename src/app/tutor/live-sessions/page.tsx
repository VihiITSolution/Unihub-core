"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { liveSessionService, MeetingIdentity } from "@/services/live-session.service";
import type { LiveSession } from "@/types";
import { TOKEN_KEY } from "@/lib/constants";
import { ConfirmDialog } from "@/components/ui";

type InviteCopyResult = "copied" | "shared" | "cancelled" | "manual";

async function copyOrShareInvite(text: string, title: string): Promise<InviteCopyResult> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return "copied";
    }
  } catch {
    // Some mobile browsers block the Clipboard API even after a button tap.
    // Use the legacy selection method and then the native share sheet below.
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
  document.body.appendChild(textArea);
  let copied = false;
  try {
    textArea.focus();
    textArea.select();
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    document.body.removeChild(textArea);
  }
  if (copied) return "copied";

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text });
      return "shared";
    } catch (error: any) {
      if (error?.name === "AbortError") return "cancelled";
    }
  }
  return "manual";
}

export default function TutorLiveSessionsPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [identity, setIdentity] = useState<MeetingIdentity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const [manualInviteText, setManualInviteText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<{ session: LiveSession; action: "end" | "cancel" } | null>(null);
  const [actingOnSessionId, setActingOnSessionId] = useState<string | null>(null);
  const [copyingSessionId, setCopyingSessionId] = useState<string | null>(null);

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
      setError(null);
      setShareNotice(null);
      setActingOnSessionId(session.id);
      const response = action === "start"
        ? await liveSessionService.startSession(session.id, token)
        : action === "end"
          ? await liveSessionService.endSession(session.id, token)
          : await liveSessionService.cancelSession(session.id, token);
      const joinUrl = (response as any).data?.joinUrl;
      if (joinUrl) window.open(joinUrl, "_blank", "noopener,noreferrer");
      await load();
      setPendingAction(null);
    } catch (err: any) { setError(err.message || `Failed to ${action} session`); }
    finally { setActingOnSessionId(null); }
  };

  const copyReferralInvite = async (session: LiveSession) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      setError(null);
      setManualInviteText(null);
      setCopyingSessionId(session.id);
      const response = await liveSessionService.getReferralLink(session.id, token);
      if (!response.success || !response.data) throw new Error(response.message || "Unable to create the share link");
      const inviteText = response.data.shareMessage || response.data.inviteUrl;
      const result = await copyOrShareInvite(inviteText, `Join ${session.title} on UniHub`);
      if (result === "copied") setShareNotice(`Invitation message with the session details and registration link copied for “${session.title}”.`);
      else if (result === "shared") setShareNotice("Your phone’s share options are open. Choose an app to send the invitation.");
      else if (result === "manual") {
        setManualInviteText(inviteText);
        setShareNotice("Your browser blocked copying. Select and copy the invitation text below.");
      }
    } catch (err: any) {
      setError(err.message || "Unable to copy the referral invite link");
    } finally {
      setCopyingSessionId(null);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading live sessions…</div>;
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-bold">My live sessions</h1><p className="mt-1 text-gray-600">Teams requests, approvals, and attendance in one place.</p></div>
        <Link href="/tutor/live-sessions/create" className="rounded-lg bg-blue-600 px-5 py-2.5 text-white">Request session</Link>
      </div>
      {identity && <div className={`mt-5 rounded-lg border p-4 ${identity.invitationStatus === "accepted" ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>Microsoft identity: <strong>{identity.email}</strong> · {identity.invitationStatus}{identity.invitationRedeemUrl && identity.invitationStatus !== "accepted" && <a className="ml-3 underline" href={identity.invitationRedeemUrl} target="_blank" rel="noreferrer">Accept invitation</a>}</div>}
      {error && <div role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}
      {shareNotice && <div role="status" className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">{shareNotice}</div>}
      {manualInviteText && <textarea aria-label="Referral invitation text" readOnly value={manualInviteText} onFocus={(event) => event.currentTarget.select()} onClick={(event) => event.currentTarget.select()} className="mt-3 min-h-36 w-full rounded-lg border border-gray-300 p-3 text-sm" />}
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
                {session.status === "scheduled" && session.approvalStatus === "approved" && session.providerStatus === "ready" && <button type="button" onClick={() => act(session, "start")} disabled={actingOnSessionId === session.id} className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-60">{actingOnSessionId === session.id ? "Starting…" : "Start in Teams"}</button>}
                {session.status === "scheduled" && <Link href={`/tutor/live-sessions/${session.id}/edit`} className="rounded border px-4 py-2">Reschedule</Link>}
                {session.status === "scheduled" && <button type="button" disabled={copyingSessionId === session.id} onClick={() => copyReferralInvite(session)} className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-60">{copyingSessionId === session.id ? "Preparing invite…" : "Copy referral invite"}</button>}
                {session.status === "live" && <button type="button" onClick={() => setPendingAction({ session, action: "end" })} disabled={actingOnSessionId === session.id} className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-60">End</button>}
                {session.status === "scheduled" && <button type="button" onClick={() => setPendingAction({ session, action: "cancel" })} disabled={actingOnSessionId === session.id} className="rounded border border-red-300 px-4 py-2 text-red-700 disabled:opacity-60">Cancel</button>}
                {session.recordingUrl && <Link href={`/tutor/live-sessions/${session.id}/recording`} className="rounded bg-purple-600 px-4 py-2 text-white">Manage recording</Link>}
                <Link href={`/tutor/live-sessions/${session.id}/enrollments`} className="rounded bg-gray-100 px-4 py-2">Enrollments</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      <ConfirmDialog
        isOpen={Boolean(pendingAction)}
        title={pendingAction?.action === "end" ? "End this session?" : "Cancel this session?"}
        description={pendingAction?.action === "end" ? "The session will end and UniHub will import available Teams artifacts." : "Students will no longer be able to join this session."}
        confirmLabel={pendingAction?.action === "end" ? "End session" : "Cancel session"}
        cancelLabel="Keep session"
        isConfirming={Boolean(pendingAction && actingOnSessionId === pendingAction.session.id)}
        onConfirm={() => { if (pendingAction) void act(pendingAction.session, pendingAction.action); }}
        onCancel={() => { if (!actingOnSessionId) setPendingAction(null); }}
      />
    </div>
  );
}
