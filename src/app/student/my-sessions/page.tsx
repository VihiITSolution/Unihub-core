"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { liveSessionService } from "@/services/live-session.service";
import type { SessionEnrollment } from "@/types";

export default function MySessionsPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<SessionEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming">("all");

  useEffect(() => {
    loadEnrollments();
  }, [filter]);

  const loadEnrollments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const filters = filter === "upcoming" ? { upcoming: true } : undefined;
      const response = await liveSessionService.getMyEnrollments(
        filters,
        token ?? undefined,
      );
      setEnrollments(response.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load enrollments");
    } finally {
      setIsLoading(false);
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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
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
        <h1 className="text-3xl font-bold">My Enrolled Sessions</h1>
        <Link
          href="/student/live-sessions"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
        >
          Browse Sessions
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["all", "upcoming"].map((f) => (
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

      {/* Enrollments List */}
      {enrollments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">
            You haven't enrolled in any sessions yet
          </p>
          <Link
            href="/student/live-sessions"
            className="text-blue-600 hover:underline"
          >
            Browse available live sessions
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => {
            const session = enrollment.session;
            if (!session) return null;

            return (
              <div
                key={enrollment.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {session.title}
                    </h3>
                    <p className="text-gray-600 mb-2">{session.description}</p>

                    <div className="flex gap-4 text-sm text-gray-500 mb-2">
                      <span>
                        👨‍🏫 {session.tutor?.firstName} {session.tutor?.lastName}
                      </span>
                      <span>📅 {formatDate(session.scheduledStartTime)}</span>
                      {enrollment.amountPaid > 0 && (
                        <span>💰 Paid ${enrollment.amountPaid.toFixed(2)}</span>
                      )}
                    </div>

                    {enrollment.joinedAt && (
                      <div className="text-sm text-gray-600">
                        <span>
                          ⏱️ Attended:{" "}
                          {formatDuration(enrollment.attendanceDuration)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    {session.status === "live" && (
                      <Link
                        href={`/student/live-sessions/${session.id}/watch`}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-medium animate-pulse"
                      >
                        🔴 Join Now
                      </Link>
                    )}

                    {session.status === "scheduled" && (
                      <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-medium">
                        Starts {formatDate(session.scheduledStartTime)}
                      </div>
                    )}

                    {(session.status === "ended" ||
                      session.status === "recorded") &&
                      session.recordingUrl && (
                        <a
                          href={session.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                        >
                          Watch Recording
                        </a>
                      )}
                  </div>
                </div>

                {/* Payment Status */}
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    Payment Status:{" "}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      enrollment.paymentStatus === "completed"
                        ? "text-green-600"
                        : enrollment.paymentStatus === "pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {enrollment.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
