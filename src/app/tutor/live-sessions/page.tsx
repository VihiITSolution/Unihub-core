"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { liveSessionService } from "@/services/live-session.service";
import type { LiveSession, LiveSessionStatus } from "@/types";
import { TOKEN_KEY } from "@/lib/constants";

export default function TutorLiveSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "live" | "ended">("all");

  useEffect(() => {
    loadSessions();
  }, [filter]);

  const loadSessions = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const filters: any = {};
      if (filter === "upcoming") {
        filters.upcoming = true;
      } else if (filter !== "all") {
        filters.status = filter;
      }

      const response = await liveSessionService.getSessions(filters, token);
      const sessionsData = Array.isArray(response.data) ? response.data : (response.data as any)?.sessions || [];
      setSessions(sessionsData);
    } catch (err: any) {
      setError(err.message || "Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async (id: string) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;

      await liveSessionService.startSession(id, token);
      loadSessions();
    } catch (err: any) {
      alert(err.message || "Failed to start session");
    }
  };

  const handleEndSession = async (id: string) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;

      if (confirm("Are you sure you want to end this session?")) {
        await liveSessionService.endSession(id, token);
        loadSessions();
      }
    } catch (err: any) {
      alert(err.message || "Failed to end session");
    }
  };

  const handleCancelSession = async (id: string) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;

      if (confirm("Are you sure you want to cancel this session?")) {
        await liveSessionService.cancelSession(id, token);
        loadSessions();
      }
    } catch (err: any) {
      alert(err.message || "Failed to cancel session");
    }
  };

  const getStatusBadge = (status: LiveSessionStatus) => {
    const styles = {
      scheduled: "bg-blue-100 text-blue-800",
      live: "bg-green-100 text-green-800 animate-pulse",
      ended: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      recorded: "bg-purple-100 text-purple-800",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
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
        <h1 className="text-3xl font-bold">My Live Sessions</h1>
        <Link
          href="/tutor/live-sessions/create"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
        >
          + Schedule New Session
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["all", "upcoming", "live", "ended"].map((f) => (
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

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No live sessions found</p>
          <Link
            href="/tutor/live-sessions/create"
            className="text-blue-600 hover:underline"
          >
            Create your first live session
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{session.title}</h3>
                    {getStatusBadge(session.status)}
                  </div>
                  <p className="text-gray-600 mb-2">{session.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>📅 {formatDate(session.scheduledStartTime)}</span>
                    <span>
                      {session.isFree ? (
                        "🆓 Free"
                      ) : (
                        `💰 $${session.price}`
                      )}
                    </span>
                    <span>👥 {session.totalAttendees} attendees</span>
                    {!session.isFree && (
                      <span>💵 Revenue: ${session.totalRevenue.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  {session.status === "scheduled" && (
                    <>
                      <button
                        onClick={() => handleStartSession(session.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Start Session
                      </button>
                      <button
                        onClick={() => router.push(`/tutor/live-sessions/${session.id}/edit`)}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleCancelSession(session.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {session.status === "live" && (
                    <>
                      <a
                        href={`https://www.youtube.com/watch?v=${session.youtubeVideoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Watch Stream
                      </a>
                      <button
                        onClick={() => handleEndSession(session.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                      >
                        End Session
                      </button>
                    </>
                  )}

                  {(session.status === "ended" || session.status === "recorded") && session.recordingUrl && (
                    <a
                      href={session.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    >
                      View Recording
                    </a>
                  )}

                  <Link
                    href={`/tutor/live-sessions/${session.id}/enrollments`}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                  >
                    View Enrollments
                  </Link>
                </div>
              </div>

              {/* Session Details */}
              {session.youtubeVideoId && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                  <span className="font-medium">YouTube Video ID:</span> {session.youtubeVideoId}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
