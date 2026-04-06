"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { liveSessionService } from "@/services/live-session.service";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Loading } from "@/components/ui";
import type { CreateLiveSessionData } from "@/types";
import { TOKEN_KEY } from "@/lib/constants";

export default function CreateLiveSessionPage() {
  const router = useRouter();
  const { isChecking } = useRoleCheck({
    requiredRole: "tutor",
    requireApproval: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamInfo, setStreamInfo] = useState<{
    streamUrl: string;
    streamKey: string;
    watchUrl: string;
  } | null>(null);

  const [formData, setFormData] = useState<CreateLiveSessionData>({
    title: "",
    description: "",
    scheduledStartTime: "",
    scheduledEndTime: "",
    isFree: true,
    price: 0,
    maxAttendees: undefined,
    allowRecording: true,
    enableChat: true,
    privacyStatus: "unlisted",
    tags: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        throw new Error("Please log in to create a live session");
      }

      const response = await liveSessionService.createSession(formData, token);

      setStreamInfo({
        streamUrl: response.data.streaming.streamUrl,
        streamKey: response.data.streaming.streamKey,
        watchUrl: response.data.streaming.watchUrl,
      });

      // Optionally redirect after a delay to show stream info
      setTimeout(() => {
        router.push("/tutor/live-sessions");
      }, 5000);
    } catch (err: any) {
      setError(err.message || "Failed to create live session");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "tags") {
      setFormData((prev) => ({
        ...prev,
        tags: value.split(",").map((t) => t.trim()),
      }));
    } else if (name === "price" || name === "maxAttendees") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? Number(value) : undefined,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (streamInfo) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            ✅ Live Session Created Successfully!
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Stream Settings for OBS/Streamlabs:
              </h3>
              <div className="bg-white p-4 rounded border">
                <p className="text-sm text-gray-600 mb-2">Stream URL:</p>
                <code className="block bg-gray-100 p-2 rounded text-sm break-all">
                  {streamInfo.streamUrl}
                </code>
              </div>
              <div className="bg-white p-4 rounded border mt-2">
                <p className="text-sm text-gray-600 mb-2">Stream Key:</p>
                <code className="block bg-gray-100 p-2 rounded text-sm break-all">
                  {streamInfo.streamKey}
                </code>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Watch URL:</h3>
              <a
                href={streamInfo.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {streamInfo.watchUrl}
              </a>
            </div>

            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-900">
                <li>
                  Configure your streaming software (OBS/Streamlabs) with the
                  above settings
                </li>
                <li>Start streaming in your software</li>
                <li>
                  Click "Start Session" in the dashboard when ready to go live
                </li>
                <li>Students can join and watch your live stream</li>
              </ol>
            </div>
          </div>

          <button
            onClick={() => router.push("/tutor/live-sessions")}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Go to Live Sessions Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isChecking) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Schedule Live Session</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Introduction to React Hooks"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Detailed description of what will be covered..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time *
            </label>
            <input
              type="datetime-local"
              name="scheduledStartTime"
              value={formData.scheduledStartTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time *
            </label>
            <input
              type="datetime-local"
              name="scheduledEndTime"
              value={formData.scheduledEndTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isFree"
                checked={formData.isFree}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">
                Free Session
              </span>
            </label>
          </div>

          {!formData.isFree && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (LKR)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Attendees (Optional)
            </label>
            <input
              type="number"
              name="maxAttendees"
              value={formData.maxAttendees || ""}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Unlimited"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy Status
            </label>
            <select
              name="privacyStatus"
              value={formData.privacyStatus}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="unlisted">Unlisted (default)</option>
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags?.join(", ") || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="react, javascript, web-development"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="allowRecording"
              checked={formData.allowRecording}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Allow Recording
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="enableChat"
              checked={formData.enableChat}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Enable Live Chat
            </span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? "Creating..." : "Create Live Session"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
