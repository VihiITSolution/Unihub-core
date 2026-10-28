"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, FolderPlus, Save, Tag, Video } from "lucide-react";
import { courseService } from "@/services/course.service";
import { liveSessionService } from "@/services/live-session.service";
import { TOKEN_KEY } from "@/lib/constants";
import type { Course, LiveSession } from "@/types";

export default function RecordingManagerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<LiveSession | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState("");
  const [courseId, setCourseId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          router.replace("/auth/login");
          return;
        }
        const [sessionsResponse, coursesResponse] = await Promise.all([
          liveSessionService.getMySessions(token),
          courseService.getTutorCourses(token),
        ]);
        const recording = (sessionsResponse.data.sessions || []).find((item) => String(item.id) === id);
        if (!recording?.recordingUrl) {
          setError("This recording is not available yet. It can take a few minutes to import after the session ends.");
          return;
        }
        setSession(recording);
        setTitle(recording.title);
        setLessonTitle(recording.title);
        setDescription(recording.description || "");
        setCategories((recording.tags || []).join(", "));
        setCourses(Array.isArray(coursesResponse.data) ? coursesResponse.data : []);
      } catch (requestError: any) {
        setError(requestError.message || "Unable to load this recording.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, router]);

  const saveDetails = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      setSaving(true);
      setError(null);
      setNotice(null);
      const tags = categories.split(",").map((tag) => tag.trim()).filter(Boolean);
      const response = await liveSessionService.updateRecording(id, { title, description, tags }, token);
      if (!response.success) throw new Error(response.message || "Unable to save recording details.");
      setSession(response.data?.session || session);
      setCategories(tags.join(", "));
      setNotice("Recording details saved.");
    } catch (requestError: any) {
      setError(requestError.message || "Unable to save recording details.");
    } finally {
      setSaving(false);
    }
  };

  const addToCourse = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || !courseId) return;
    try {
      setImporting(true);
      setError(null);
      setNotice(null);
      const response = await liveSessionService.addRecordingToCourse(id, { courseId, title: lessonTitle, isPreview }, token);
      if (!response.success) throw new Error(response.message || "Unable to add the recording to this course.");
      setNotice("Recording uploaded to the selected course as a video lesson.");
    } catch (requestError: any) {
      setError(requestError.message || "Unable to add the recording to this course.");
    } finally {
      setImporting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-600">Loading recording…</div>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/tutor/live-sessions" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-950">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to live sessions
      </Link>

      <header className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Recording library</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-950">Manage recording</h1>
          <p className="mt-2 max-w-2xl text-gray-600">Organize this session recording, then add it to one of your courses as a secure video lesson.</p>
        </div>
        {session?.recordingUrl && (
          <a href={session.recordingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50">
            Open source recording <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </header>

      {error && <div role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">{error}</div>}
      {notice && <div role="status" className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">{notice}</div>}

      {session && <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2"><Video className="h-5 w-5 text-indigo-600" aria-hidden="true" /><h2 className="text-lg font-bold text-gray-950">Recording details</h2></div>
          <div className="mt-5 space-y-4">
            <label className="block"><span className="text-sm font-semibold text-gray-800">Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={255} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" /></label>
            <label className="block"><span className="text-sm font-semibold text-gray-800">Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={5} maxLength={10000} className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" /></label>
            <label className="block"><span className="flex items-center gap-2 text-sm font-semibold text-gray-800"><Tag className="h-4 w-4" aria-hidden="true" />Categories</span><input value={categories} onChange={(event) => setCategories(event.target.value)} placeholder="e.g. Mathematics, Calculus, Revision" className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" /><span className="mt-1.5 block text-xs text-gray-500">Separate up to 10 categories with commas.</span></label>
            <button type="button" onClick={saveDetails} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"><Save className="h-4 w-4" aria-hidden="true" />{saving ? "Saving…" : "Save details"}</button>
          </div>
        </section>

        <aside className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-5 sm:p-6">
          <div className="flex items-center gap-2"><FolderPlus className="h-5 w-5 text-indigo-700" aria-hidden="true" /><h2 className="font-bold text-gray-950">Add to a course</h2></div>
          <p className="mt-2 text-sm leading-6 text-gray-700">UniHub copies the managed recording to the course video library. Students keep course-based access.</p>
          <div className="mt-5 space-y-4">
            <label className="block"><span className="text-sm font-semibold text-gray-800">Course</span><select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"><option value="">Choose a course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
            <label className="block"><span className="text-sm font-semibold text-gray-800">Lesson title</span><input value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} maxLength={255} className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100" /></label>
            <label className="flex items-start gap-2 text-sm text-gray-700"><input type="checkbox" checked={isPreview} onChange={(event) => setIsPreview(event.target.checked)} className="mt-1" />Make this lesson available as a course preview</label>
            <button type="button" onClick={addToCourse} disabled={!courseId || importing} className="w-full rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60">{importing ? "Uploading recording…" : "Add as course lesson"}</button>
          </div>
        </aside>
      </div>}
    </main>
  );
}
