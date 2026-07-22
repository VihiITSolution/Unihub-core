"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { liveSessionService } from "@/services/live-session.service";
import type { LiveSession } from "@/types";
import { TOKEN_KEY } from "@/lib/constants";

export default function StudentLiveSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "free" | "paid" | "upcoming">(
    "all",
  );

  useEffect(() => {
    loadSessions();
  }, [filter]);

  const loadSessions = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      const filters: any = {};
      if (filter === "upcoming") {
        filters.upcoming = true;
      } else if (filter === "free") {
        filters.isFree = true;
      } else if (filter === "paid") {
        filters.isFree = false;
      }

      const response = await liveSessionService.getSessions(
        filters,
        token || undefined,
      );
      const sessionsData = Array.isArray(response.data)
        ? response.data
        : (response.data as any)?.sessions || [];
      setSessions(sessionsData);
    } catch (err: any) {
      setError(err.message || "Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (sessionId: string, isFree: boolean) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        router.push("/auth/login");
        return;
      }

      if (!isFree) {
        // TODO: Implement payment flow
        alert(
          "Payment integration coming soon! For now, this will enroll you for free.",
        );
      }

      await liveSessionService.enrollInSession(sessionId, {}, token);
      alert("Successfully enrolled in the session!");
      loadSessions();
    } catch (err: any) {
      alert(err.message || "Failed to enroll in session");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-800",
      live: "bg-green-100 text-green-800 animate-pulse",
      ended: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      recorded: "bg-purple-100 text-purple-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Live Sessions</h1>
        <Link
          href="/student/my-sessions"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
        >
          My Enrolled Sessions
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "upcoming", "free", "paid"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-md font-medium ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No live sessions available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold flex-1">
                    {session.title}
                  </h3>
                  {getStatusBadge(session.status)}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {session.description || "No description"}
                </p>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <span>👨‍🏫</span>
                    <span>
                      {session.tutor?.firstName} {session.tutor?.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>{formatDate(session.scheduledStartTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>
                      {session.totalAttendees}{" "}
                      {session.maxAttendees ? `/ ${session.maxAttendees}` : ""}{" "}
                      attendees
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💰</span>
                    <span className="font-semibold">
                      {session.isFree ? "Free" : `Rs. ${session.price}`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {session.status === "scheduled" && (
                  <button
                    onClick={() => handleEnroll(session.id, session.isFree)}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-medium"
                  >
                    {session.isFree
                      ? "Enroll Free"
                      : `Enroll for Rs. ${session.price}`}
                  </button>
                )}

                {session.status === "live" && (
                  <Link
                    href={`/student/live-sessions/${session.id}/watch`}
                    className="block w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 font-medium text-center"
                  >
                    🔴 Join Live Now
                  </Link>
                )}

                {(session.status === "ended" ||
                  session.status === "recorded") &&
                  session.recordingUrl && (
                    <a
                      href={session.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 font-medium text-center"
                    >
                      Watch Recording
                    </a>
                  )}

                {session.status === "cancelled" && (
                  <div className="w-full bg-red-100 text-red-800 py-2 rounded-md text-center font-medium">
                    Cancelled
                  </div>
                )}
              </div>

              {session.tags && session.tags.length > 0 && (
                <div className="px-6 pb-4">
                  <div className="flex flex-wrap gap-2">
                    {session.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
