"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Loading } from "@/components/ui";
import { courseService, type TutorDashboardData } from "@/services/course.service";

const currency = (value: number) =>
  `LKR ${value.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function TutorEarningsPage() {
  const router = useRouter();
  const { token, isAuthenticated, hasRole } = useAuth();
  const { isChecking } = useRoleCheck({ requiredRole: "tutor", requireApproval: false });
  const [dashboard, setDashboard] = useState<TutorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await courseService.getTutorDashboard(token);
      if (!response.success || !response.data) {
        throw new Error(response.message || "We could not load your earnings right now.");
      }
      setDashboard(response.data);
    } catch (loadError) {
      setDashboard(null);
      setError(loadError instanceof Error ? loadError.message : "We could not load your earnings right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }
    if (!hasRole("tutor")) {
      router.replace("/");
      return;
    }
    if (token) void loadDashboard();
  }, [isAuthenticated, hasRole, router, token]);

  if (isChecking) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loading /></div>;
  }

  const courses = dashboard?.courses ?? [];
  const publishedCourses = courses.filter((course) => course.approvalStatus === "approved");
  const totalEnrollments = publishedCourses.reduce((sum, course) => sum + (course.enrollmentCount ?? 0), 0);
  const stats = dashboard?.stats;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Course earnings</h1>
          <p className="text-gray-500 text-sm">Completed course payments and your teaching activity.</p>
        </div>

        {error && (
          <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <span>{error}</span>
            <button type="button" onClick={loadDashboard} className="rounded-md px-3 py-1.5 font-semibold text-red-900 underline underline-offset-2 hover:bg-red-100">Try again</button>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Completed payments", value: stats ? currency(stats.totalRevenue) : "—", color: "text-blue-700" },
            { label: "Total enrollments", value: stats ? stats.totalStudents.toLocaleString() : "—", color: "text-purple-700" },
            { label: "Published courses", value: stats ? publishedCourses.length.toString() : "—", color: "text-emerald-700" },
            { label: "Average rating", value: stats?.averageRating ? `${stats.averageRating.toFixed(1)} / 5` : stats ? "No ratings yet" : "—", color: "text-amber-700" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{loading ? "—" : stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Course activity</h2>
            <p className="mt-1 text-sm text-gray-500">Enrollment and review totals are live. Individual payout amounts appear after settlement data is available.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loading /></div>
          ) : !error && publishedCourses.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3" aria-hidden="true">💰</p>
              <p className="font-medium text-gray-600">No published courses yet</p>
              <p className="text-sm mt-1">Completed payments will appear after students enroll in an approved course.</p>
            </div>
          ) : !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th scope="col" className="text-left px-6 py-3">Course</th>
                    <th scope="col" className="text-right px-4 py-3">Current price</th>
                    <th scope="col" className="text-right px-4 py-3">Enrollments</th>
                    <th scope="col" className="text-right px-6 py-3">Reviews</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {publishedCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 line-clamp-1">{course.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">{course.level}</p>
                      </td>
                      <td className="px-4 py-4 text-right text-gray-700">{course.price === 0 ? <span className="text-green-600 font-medium">Free</span> : currency(Number(course.price))}</td>
                      <td className="px-4 py-4 text-right text-gray-700">{course.enrollmentCount ?? 0}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{course.reviewCount ?? 0}{course.rating ? ` · ${course.rating.toFixed(1)} ★` : ""}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-3 text-gray-700" colSpan={2}>Total</td>
                    <td className="px-4 py-3 text-right text-gray-700">{totalEnrollments}</td>
                    <td className="px-6 py-3 text-right text-gray-700">—</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">Completed payments are not the same as a payout. Payout timing and deductions follow the applicable tutor agreement.</p>
      </div>
    </div>
  );
}
