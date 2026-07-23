"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/lib/constants";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Loading } from "@/components/ui";
import type { Course } from "@/types";

export default function TutorEarningsPage() {
  const router = useRouter();
  const { token, isAuthenticated, hasRole } = useAuth();
  const { isChecking } = useRoleCheck({ requiredRole: "tutor", requireApproval: false });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    if (!hasRole("tutor")) { router.push("/"); return; }
    loadCourses();
  }, [isAuthenticated, hasRole, router]);

  const loadCourses = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/courses/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCourses(Array.isArray(data.data) ? data.data : []);
    } catch {
      // silently fail — table will be empty
    } finally {
      setLoading(false);
    }
  };

  const publishedCourses = courses.filter((c: any) => c.approvalStatus === "approved");
  const totalEnrollments = publishedCourses.reduce((s: number, c: any) => s + (c.enrollmentCount || 0), 0);
  const totalRevenue = publishedCourses.reduce(
    (s: number, c: any) => s + (c.enrollmentCount || 0) * parseFloat(c.price || 0),
    0,
  );
  const platformFee = 0.20; // 20% platform cut
  const netEarnings = totalRevenue * (1 - platformFee);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Earnings</h1>
          <p className="text-gray-500 text-sm">Lifetime earnings across all your published courses</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue", value: `LKR ${totalRevenue.toLocaleString("en-LK", { maximumFractionDigits: 2 })}`, color: "text-blue-700" },
            { label: "Platform Fee (20%)", value: `LKR ${(totalRevenue * platformFee).toLocaleString("en-LK", { maximumFractionDigits: 2 })}`, color: "text-red-500" },
            { label: "Net Earnings", value: `LKR ${netEarnings.toLocaleString("en-LK", { maximumFractionDigits: 2 })}`, color: "text-green-700" },
            { label: "Total Enrollments", value: totalEnrollments.toString(), color: "text-purple-700" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{loading ? "—" : stat.value}</p>
            </div>
          ))}
        </div>

        {/* Per-course breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Course Breakdown</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loading /></div>
          ) : publishedCourses.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">💰</p>
              <p className="font-medium text-gray-600">No published courses yet</p>
              <p className="text-sm mt-1">Earnings appear once a course is approved and students enrol.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-6 py-3">Course</th>
                    <th className="text-right px-4 py-3">Price</th>
                    <th className="text-right px-4 py-3">Enrollments</th>
                    <th className="text-right px-4 py-3">Gross</th>
                    <th className="text-right px-6 py-3">Net (80%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {publishedCourses.map((course: any) => {
                    const gross = (course.enrollmentCount || 0) * parseFloat(course.price || 0);
                    const net = gross * (1 - platformFee);
                    return (
                      <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900 line-clamp-1">{course.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 capitalize">{course.level}</p>
                        </td>
                        <td className="px-4 py-4 text-right text-gray-700">
                          {parseFloat(course.price) === 0 ? (
                            <span className="text-green-600 font-medium">Free</span>
                          ) : (
                            `LKR ${parseFloat(course.price).toLocaleString()}`
                          )}
                        </td>
                        <td className="px-4 py-4 text-right text-gray-700">{course.enrollmentCount || 0}</td>
                        <td className="px-4 py-4 text-right text-gray-700">
                          LKR {gross.toLocaleString("en-LK", { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-green-700">
                          LKR {net.toLocaleString("en-LK", { maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="px-6 py-3 text-gray-700" colSpan={2}>Total</td>
                    <td className="px-4 py-3 text-right text-gray-700">{totalEnrollments}</td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      LKR {totalRevenue.toLocaleString("en-LK", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3 text-right text-green-700">
                      LKR {netEarnings.toLocaleString("en-LK", { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          Earnings are calculated from course price × enrollments. Payouts are processed monthly.
        </p>
      </div>
    </div>
  );
}
