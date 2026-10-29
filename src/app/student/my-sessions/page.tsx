"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays, CircleAlert, CircleCheck, Clock, Mail, Receipt } from "lucide-react";
import { liveSessionService, MeetingIdentity } from "@/services/live-session.service";
import type { SessionEnrollment } from "@/types";
import { TOKEN_KEY } from "@/lib/constants";

type Filter = "all" | "upcoming";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
];

const PAYMENT_LABELS: Record<string, string> = {
  completed: "Paid",
  pending: "Payment pending",
  failed: "Payment failed",
  refunded: "Refunded",
};

export default function MySessionsPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<SessionEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [identity, setIdentity] = useState<MeetingIdentity | null>(null);

  useEffect(() => {
    loadEnrollments();
  }, [filter]);

  const loadEnrollments = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const filters = filter === "upcoming" ? { upcoming: true } : undefined;
      const [response, identityResponse] = await Promise.all([
        liveSessionService.getMyEnrollments(filters, token),
        liveSessionService.getMeetingIdentity(token, "student"),
      ]);
      const enrollmentData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.enrollments || [];
      setEnrollments(enrollmentData);
      setIdentity(identityResponse.data.identity);
    } catch (err: any) {
      setError(err.message || "We couldn't load your sessions. Try again in a moment.");
    } finally {
      setIsLoading(false);
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

  const formatDuration = (minutesTotal: number) => {
    const hours = Math.floor(minutesTotal / 60);
    const minutes = minutesTotal % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96" role="status" aria-live="polite">
        <span className="h-10 w-10 rounded-full border-2 border-gray-200 border-t-blue-600 motion-safe:animate-spin" />
        <span className="sr-only">Loading your sessions</span>
      </div>
    );
  }

  const invitationAccepted = identity?.invitationStatus === "accepted";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <header className="flex flex-wrap gap-4 justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My sessions</h1>
          <p className="mt-1 text-gray-600">Sessions you've enrolled in, and your attendance.</p>
        </div>
        <Link
          href="/student/live-sessions"
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Browse sessions
        </Link>
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

      {identity && (
        <div
          className={`mb-6 flex gap-3 rounded-md border px-4 py-4 ${
            invitationAccepted
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {invitationAccepted ? (
            <CircleCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
          ) : (
            <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
          )}
          <div className="min-w-0">
            {invitationAccepted ? (
              <>
                <p className="font-medium">You're set up to join on Microsoft Teams</p>
                <p className="mt-1 text-sm break-words">Connected as {identity.email}.</p>
              </>
            ) : (
              <>
                <p className="font-medium">Accept your Teams invitation to join sessions</p>
                <p className="mt-1 text-sm break-words">
                  We've sent an invitation to {identity.email}. Accept it before your first
                  session — the join button won't work until you do.
                </p>
                {identity.invitationRedeemUrl && (
                  <a
                    href={identity.invitationRedeemUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block font-medium underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
                  >
                    Accept the invitation
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter sessions">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={`rounded-md px-4 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
              filter === value
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {enrollments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-gray-400" aria-hidden="true" />
          <p className="mt-3 font-medium text-gray-900">
            {filter === "upcoming" ? "Nothing coming up" : "You haven't enrolled in a session yet"}
          </p>
          <p className="mt-1 text-gray-600">
            {filter === "upcoming"
              ? "Your past sessions are still here under All."
              : "Browse what tutors have scheduled and enrol in one."}
          </p>
          <Link
            href="/student/live-sessions"
            className="mt-4 inline-block font-medium text-blue-600 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Browse sessions
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {enrollments.map((enrollment) => {
            const session = (enrollment as any).session;
            if (!session) return null;

            return (
              <li
                key={enrollment.id}
                className="rounded-lg border border-gray-200 bg-white p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">{session.title}</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {session.tutor?.firstName} {session.tutor?.lastName}
                    </p>

                    {session.description && (
                      <p className="mt-3 text-sm text-gray-600">{session.description}</p>
                    )}

                    <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          className="h-4 w-4 shrink-0 text-gray-400"
                          aria-hidden="true"
                        />
                        <dt className="sr-only">Starts</dt>
                        <dd>{formatDate(session.scheduledStartTime)}</dd>
                      </div>

                      {enrollment.amountPaid > 0 && (
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                          <dt className="sr-only">Paid</dt>
                          <dd>
                            Rs. {Number(enrollment.amountPaid).toLocaleString("en-LK")}
                          </dd>
                        </div>
                      )}

                      {(enrollment.attended || enrollment.joinedAt) && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                          <dt className="sr-only">Attended</dt>
                          <dd>
                            Attended {formatDuration(enrollment.attendanceDuration ?? 0)}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {session.status === "live" && (
                      <Link
                        href={`/student/live-sessions/${session.id}/watch`}
                        className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-pulse" />
                        Join session
                      </Link>
                    )}

                    {session.status === "scheduled" && (
                      <span className="rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        {formatDate(session.scheduledStartTime)}
                      </span>
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
                      <span className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>

                {enrollment.paymentStatus !== "completed" && (
                  <p className="mt-4 border-t border-gray-100 pt-3 text-sm font-medium text-amber-700">
                    {PAYMENT_LABELS[enrollment.paymentStatus] ?? enrollment.paymentStatus}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
