"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { liveSessionService } from "@/services/live-session.service";
import type { SessionEnrollment } from "@/types";
import { TOKEN_KEY } from "@/lib/constants";

export default function SessionEnrollmentsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [enrollments, setEnrollments] = useState<SessionEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEnrollments();
  }, [sessionId]);

  const loadEnrollments = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await liveSessionService.getSessionEnrollments(sessionId, token);
      const enrollmentData = response.data?.enrollments;
      setEnrollments(Array.isArray(enrollmentData) ? enrollmentData : []);
    } catch (err: any) {
      setError(err.message || "Failed to load enrollments");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
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
        <h1 className="text-3xl font-bold">Session Enrollments</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Enrolled</p>
          <p className="text-2xl font-bold">{enrollments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Attended</p>
          <p className="text-2xl font-bold">
            {enrollments.filter((e) => e.joinedAt).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Payment Completed</p>
          <p className="text-2xl font-bold">
            {enrollments.filter((e) => e.paymentStatus === "completed").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold">
            ${enrollments.reduce((sum, e) => sum + e.amountPaid, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Enrollments Table */}
      {enrollments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No enrollments yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium text-gray-900">
                        {enrollment.student?.firstName} {enrollment.student?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{enrollment.student?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium">${enrollment.amountPaid.toFixed(2)}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          enrollment.paymentStatus === "completed"
                            ? "bg-green-100 text-green-800"
                            : enrollment.paymentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {enrollment.paymentStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(enrollment.joinedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {enrollment.attendanceDuration > 0
                      ? formatDuration(enrollment.attendanceDuration)
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {enrollment.joinedAt ? (
                      enrollment.leftAt ? (
                        <span className="text-gray-600">Left</span>
                      ) : (
                        <span className="text-green-600 font-medium">Active</span>
                      )
                    ) : (
                      <span className="text-gray-400">Not joined</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
