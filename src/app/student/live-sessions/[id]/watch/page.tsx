"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { liveSessionService } from "@/services/live-session.service";
import type { LiveSession } from "@/types";
import { TOKEN_KEY } from "@/lib/constants";

export default function WatchLiveSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<LiveSession | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [chatUrl, setChatUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return router.push("/auth/login");
        const response = await liveSessionService.joinSession(id, token);
        setSession(response.data.session);
        if (response.data.launchMode === "external" && response.data.joinUrl) {
          window.open(response.data.joinUrl, "_blank", "noopener,noreferrer");
        } else {
          setEmbedUrl(response.data.embedUrl || null);
          setChatUrl(response.data.chatUrl || null);
        }
      } catch (err: any) { setError(err.message || "Unable to join session"); }
      finally { setLoading(false); }
    })();
  }, [id, router]);

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Preparing your session…</div>;
  if (error) return <div className="min-h-screen bg-slate-950 p-6 text-white flex items-center justify-center"><div className="max-w-lg rounded-xl bg-red-950 p-8 text-center"><h1 className="text-2xl font-bold">Unable to join</h1><p className="mt-3">{error}</p><button onClick={() => router.back()} className="mt-6 rounded bg-white px-5 py-2 text-red-950">Go back</button></div></div>;
  if (session?.provider === "teams") return (
    <div className="min-h-screen bg-slate-950 p-6 text-white flex items-center justify-center">
      <div className="max-w-xl rounded-2xl bg-slate-900 p-8 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold">T</div>
        <h1 className="mt-5 text-2xl font-bold">{session.title}</h1>
        <p className="mt-3 text-slate-300">Microsoft Teams opened in a new tab. Sign in with the same verified email used for your UniHub account.</p>
        <button onClick={() => router.push("/student/my-sessions")} className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5">Return to my sessions</button>
      </div>
    </div>
  );
  if (!session || !embedUrl) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Session unavailable</div>;
  return <div className="h-screen bg-black flex"><iframe src={embedUrl} className={chatUrl ? "w-3/4 h-full" : "w-full h-full"} allowFullScreen title={session.title} />{chatUrl && <iframe src={chatUrl} className="w-1/4 h-full" title="Live chat" />}</div>;
}
