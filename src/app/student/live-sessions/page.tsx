"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays, CircleAlert, Mail, Play, Users, Video } from "lucide-react";
import { liveSessionService } from "@/services/live-session.service";
import type { MeetingIdentity } from "@/services/live-session.service";
import type { LiveSession } from "@/types";
import { TOKEN_KEY } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";

type Filter = "all" | "upcoming" | "free" | "recordings";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All sessions" },
  { value: "upcoming", label: "Upcoming" },
  { value: "free", label: "Free" },
  { value: "recordings", label: "Recordings" },
];

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  live: "Live now",
  ended: "Ended",
  cancelled: "Cancelled",
  recorded: "Recording ready",
};

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700 ring-blue-600/20",
  live: "bg-green-50 text-green-700 ring-green-600/20",
  ended: "bg-gray-100 text-gray-600 ring-gray-500/20",
  cancelled: "bg-red-50 text-red-700 ring-red-600/20",
  recorded: "bg-purple-50 text-purple-700 ring-purple-600/20",
};

export default function StudentLiveSessionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [needsInvitation, setNeedsInvitation] = useState(false);
  const [identity, setIdentity] = useState<MeetingIdentity | null>(null);
  const [enrollingSessionId, setEnrollingSessionId] = useState<string | null>(null);
  const [teamsEmailSessionId, setTeamsEmailSessionId] = useState<string | null>(null);
  const [teamsEmail, setTeamsEmail] = useState("");
  const [settingTeamsEmail, setSettingTeamsEmail] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    loadSessions();
  }, [filter]);

  const loadSessions = async () => {
    try {
      setError(null);
      const token = localStorage.getItem(TOKEN_KEY);

      const filters: any = {};
      if (filter === "upcoming") {
        filters.upcoming = true;
      } else if (filter === "free") {
        filters.isFree = true;
      } else if (filter === "recordings") {
        filters.status = "recorded";
      }

      const [response, identityResponse] = await Promise.all([
        liveSessionService.getSessions(filters, token || undefined),
        token ? liveSessionService.getMeetingIdentity(token, "student") : Promise.resolve(null),
      ]);
      const sessionsData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.sessions || [];
      setSessions(sessionsData);
      if (identityResponse?.success) setIdentity(identityResponse.data.identity);
    } catch (err: any) {
      setError(err.message || "We couldn't load the sessions. Try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTeamsEmail = () => user?.studentProfile?.studentEmail || user?.email || "";

  const enroll = async (sessionId: string, token: string) => {
    setNotice(null);
    setError(null);
    setNeedsInvitation(false);
    setEnrollingSessionId(sessionId);
    try {
      const response = await liveSessionService.enrollInSession(sessionId, {}, token);
      const nextIdentity = (response.data as any)?.identity as MeetingIdentity | null;
      if (nextIdentity) setIdentity(nextIdentity);
      if (nextIdentity?.invitationStatus === "accepted") {
        setNotice("You're enrolled. The session will appear in My sessions.");
      } else {
        setNeedsInvitation(true);
        setNotice("You're enrolled. Accept the Microsoft Teams invitation before joining the session.");
      }
      await loadSessions();
    } catch (err: any) {
      setError(err.message || "We couldn't complete your enrolment. Try again.");
    } finally {
      setEnrollingSessionId(null);
    }
  };

  const handleEnroll = async (sessionId: string) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      router.push("/auth/login");
      return;
    }
    if (!identity) {
      setEnrollingSessionId(sessionId);
      setNotice("Set up your Teams email to finish enrolling.");
      setTeamsEmail(defaultTeamsEmail());
      setTeamsEmailSessionId(sessionId);
      return;
    }
    await enroll(sessionId, token);
  };

  const openTeamsEmailForm = (sessionId: string | null = null) => {
    setError(null);
    setTeamsEmail(identity?.email || defaultTeamsEmail());
    setTeamsEmailSessionId(sessionId || "");
  };

  const saveTeamsEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem(TOKEN_KEY);
    const email = teamsEmail.trim().toLowerCase();
    if (!token) return router.push("/auth/login");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address for Microsoft Teams.");
    setSettingTeamsEmail(true);
    setError(null);
    try {
      const response = await liveSessionService.setMeetingIdentity(email, token, false, "student");
      const nextIdentity = response.data?.identity;
      if (!nextIdentity) throw new Error("Unable to set up your Teams email.");
      setIdentity(nextIdentity);
      const sessionId = teamsEmailSessionId;
      setTeamsEmailSessionId(null);
      if (sessionId) await enroll(sessionId, token);
      else {
        setNeedsInvitation(true);
        setNotice("Your Microsoft Teams invitation has been sent. Accept it before joining a session.");
      }
    } catch (err: any) {
      setError(err.message || "We couldn't set up that Teams email. Try a different email address.");
    } finally {
      setSettingTeamsEmail(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const relativeStart = (dateString: string) => {
    const diffMs = new Date(dateString).getTime() - Date.now();
    if (diffMs <= 0) return null;
    const minutes = Math.round(diffMs / 60000);
    if (minutes < 60) return `Starts in ${minutes} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `Starts in ${hours} ${hours === 1 ? "hour" : "hours"}`;
    const days = Math.round(hours / 24);
    return `Starts in ${days} ${days === 1 ? "day" : "days"}`;
  };

  const price = (session: LiveSession) =>
    session.isFree ? "Free" : `Rs. ${Number(session.price).toLocaleString("en-LK")}`;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96" role="status" aria-live="polite">
        <span className="h-10 w-10 rounded-full border-2 border-gray-200 border-t-blue-600 motion-safe:animate-spin" />
        <span className="sr-only">Loading sessions</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-800 px-5 py-6 text-white shadow-sm sm:px-7">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300"><Video className="h-4 w-4" aria-hidden="true" /> Learn together, live</div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Live sessions</h1>
            <p className="mt-2 max-w-2xl text-slate-300">
              Reserve a place, join your tutor on Microsoft Teams, and revisit available recordings afterwards.
            </p>
          </div>
          <Link
            href="/student/my-sessions"
            className="rounded-md bg-white px-4 py-2.5 font-semibold text-slate-900 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            My sessions
          </Link>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-6 flex gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-800"
        >
          <CircleAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-800"
        >
          {notice}
        </div>
      )}

      {needsInvitation && (
        <div
          role="status"
          className="mb-6 flex gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900"
        >
          <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">One more step before you can join</p>
            <p className="mt-1 text-sm">
              We've emailed you a Microsoft Teams invitation. Open it and accept, using the same
              Teams email you selected. Until you do, the join button won't work.
            </p>
            <button type="button" onClick={() => openTeamsEmailForm()} className="mt-3 text-sm font-semibold underline underline-offset-2">Use a different Teams email</button>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm" role="group" aria-label="Filter sessions">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={`rounded-md px-4 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
              filter === value
                ? "bg-slate-900 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center">
          <Video className="mx-auto h-8 w-8 text-gray-400" aria-hidden="true" />
          <p className="mt-3 font-medium text-gray-900">
            {filter === "all"
              ? "No sessions scheduled yet"
              : "No sessions match this filter"}
          </p>
          <p className="mt-1 text-gray-600">
            {filter === "all"
              ? "Tutors post sessions a few days ahead. Check back soon."
              : "Try a different filter to see what else is on."}
          </p>
          {filter !== "all" && (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="mt-4 font-medium text-blue-600 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Show all sessions
            </button>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => {
            const countdown =
              session.status === "scheduled" ? relativeStart(session.scheduledStartTime) : null;

            return (
              <li
                key={session.id}
                className="flex min-h-72 flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold leading-snug text-gray-900">
                    {session.title}
                  </h2>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                      STATUS_STYLES[session.status] ?? STATUS_STYLES.ended
                    }`}
                  >
                    {session.status === "live" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600 motion-safe:animate-pulse" />
                    )}
                    {STATUS_LABELS[session.status] ?? session.status}
                  </span>
                </div>

                <p className="mt-1.5 text-sm text-gray-600">
                  {session.tutor?.firstName} {session.tutor?.lastName}
                </p>

                {session.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-gray-600">{session.description}</p>
                )}

                <dl className="mt-4 space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                    <dt className="sr-only">Starts</dt>
                    <dd>
                      {formatDate(session.scheduledStartTime)}
                      {countdown && <span className="text-gray-500"> · {countdown}</span>}
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                    <dt className="sr-only">Attendees</dt>
                    <dd>
                      {session.totalAttendees}
                      {session.maxAttendees ? ` of ${session.maxAttendees}` : ""} enrolled
                    </dd>
                  </div>
                </dl>

                {session.tags && session.tags.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {session.tags.map((tag, idx) => (
                      <li
                        key={idx}
                        className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <span className="font-semibold text-gray-900">{price(session)}</span>

                  {session.status === "scheduled" && (
                    <button
                      type="button"
                      onClick={() => handleEnroll(session.id)}
                      disabled={enrollingSessionId === session.id}
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      {enrollingSessionId === session.id ? (teamsEmailSessionId === session.id ? "Set up Teams…" : "Enrolling…") : "Enrol"}
                    </button>
                  )}

                  {session.status === "live" && (
                    <Link
                      href={`/student/live-sessions/${session.id}/watch`}
                      className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                    >
                      <Play className="h-4 w-4" aria-hidden="true" /> Join session
                    </Link>
                  )}

                  {(session.status === "ended" || session.status === "recorded") &&
                    session.recordingUrl && (
                      <a
                        href={session.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
                      >
                        Watch recording
                      </a>
                    )}

                  {session.status === "ended" && !session.recordingUrl && (
                    <span className="text-sm text-gray-500">No recording</span>
                  )}

                  {session.status === "cancelled" && (
                    <span className="text-sm font-medium text-red-700">Cancelled</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {teamsEmailSessionId !== null && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-950/50 p-4 sm:items-center sm:justify-center" role="presentation">
          <form onSubmit={saveTeamsEmail} role="dialog" aria-modal="true" aria-labelledby="student-teams-email-title" className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl sm:p-6">
            <h2 id="student-teams-email-title" className="text-xl font-bold text-gray-900">Set up Microsoft Teams</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">Use the email address you sign in to Microsoft Teams with. We suggested the confirmed email in your UniHub profile; you can change it.</p>
            {error && <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
            <label className="mt-5 block text-sm font-semibold text-gray-900" htmlFor="student-teams-email">Teams email</label>
            <input id="student-teams-email" type="email" required autoFocus value={teamsEmail} onChange={(event) => setTeamsEmail(event.target.value)} className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2.5 text-gray-900" placeholder="you@example.com" />
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" disabled={settingTeamsEmail} onClick={() => { setTeamsEmailSessionId(null); setEnrollingSessionId(null); setNotice(null); }} className="rounded-md border border-gray-300 px-4 py-2.5 font-medium text-gray-700 disabled:opacity-60">Cancel</button>
              <button type="submit" disabled={settingTeamsEmail} className="rounded-md bg-blue-700 px-4 py-2.5 font-medium text-white disabled:opacity-60">{settingTeamsEmail ? "Sending invitation…" : "Continue and enrol"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
