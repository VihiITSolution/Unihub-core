"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { liveSessionService } from "@/services/live-session.service";
import type { LiveSession } from "@/types";
import { TOKEN_KEY } from "@/lib/constants";

export default function WatchLiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<LiveSession | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [chatUrl, setChatUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    joinSession();

    return () => {
      // Leave session when component unmounts
      if (hasJoined) {
        leaveSession();
      }
    };
  }, [sessionId]);

  const joinSession = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await liveSessionService.joinSession(sessionId, token);
      
      setSession(response.data.session);
      setEmbedUrl(response.data.embedUrl || null);
      setChatUrl(response.data.chatUrl || null);
      setHasJoined(true);
    } catch (err: any) {
      setError(err.message || "Failed to join session");
    } finally {
      setIsLoading(false);
    }
  };

  const leaveSession = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;

      await liveSessionService.leaveSession(sessionId, token);
    } catch (err: any) {
      console.error("Failed to leave session:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading live session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="max-w-md bg-red-900 text-white p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Unable to Join Session</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-white text-red-900 px-6 py-2 rounded-md hover:bg-gray-100 font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!session || !embedUrl) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="text-white text-center">
          <p className="text-xl">Session not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-3 flex flex-wrap gap-3 justify-between items-center">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold truncate">{session.title}</h1>
          <p className="text-sm text-gray-400">
            with {session.tutor?.firstName} {session.tutor?.lastName}
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm("Are you sure you want to leave this session?")) {
              leaveSession();
              router.push("/student/my-sessions");
            }
          }}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md font-medium flex-shrink-0"
        >
          Leave Session
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Video Player */}
        <div className={`${session.enableChat ? "md:w-3/4 w-full" : "w-full"} bg-black`}>
          <div className="relative h-full">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={session.title}
            />
          </div>
        </div>

        {/* Live Chat (if enabled) */}
        {session.enableChat && chatUrl && (
          <div className="md:w-1/4 w-full bg-gray-900 border-t md:border-t-0 md:border-l border-gray-700" style={{ minHeight: 220 }}>
            <div className="h-full flex flex-col">
              <div className="bg-gray-800 text-white px-4 py-3 font-semibold">
                Live Chat
              </div>
              <div className="flex-1 overflow-hidden">
                <iframe
                  src={chatUrl}
                  className="w-full h-full"
                  title="Live Chat"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Session Info Bar */}
      <div className="bg-gray-900 text-white px-6 py-2 flex justify-between items-center text-sm">
        <div className="flex gap-6">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
            LIVE
          </span>
          <span>👥 {session.totalAttendees} watching</span>
        </div>
        <div className="text-gray-400">
          {session.allowRecording && "🔴 This session is being recorded"}
        </div>
      </div>
    </div>
  );
}
