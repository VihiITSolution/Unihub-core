"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { postService } from "@/services/social.service";
import { Button } from "@/components/ui";
import type { Post } from "@/types/social";

interface PostComposerProps {
  onPosted: (post: Post) => void;
}

const MAX_FILES = 4;

export function PostComposer({ onPosted }: PostComposerProps) {
  const { user, token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).slice(0, MAX_FILES - files.length);
    if (selected.length === 0) return;

    setFiles((prev) => [...prev, ...selected].slice(0, MAX_FILES));
    setPreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))].slice(0, MAX_FILES));
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!token || (!body.trim() && files.length === 0) || posting) return;

    setPosting(true);
    setError(null);
    try {
      const response = await postService.createPost(token, { body: body.trim(), files });
      if (response.success && response.data?.post) {
        onPosted(response.data.post);
        setBody("");
        setFiles([]);
        setPreviews([]);
      } else {
        setError(response.message || "Failed to post.");
      }
    } catch (err) {
      console.error("Failed to create post:", err);
      setError("Failed to post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex gap-3">
        {user?.profileImage ? (
          <img src={user.profileImage} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        )}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          className="flex-1 resize-none border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400"
        />
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-3 ml-13">
          {previews.map((src, i) => (
            <div key={src} className="relative aspect-square">
              <img src={src} alt="" className="w-full h-full object-cover rounded-md" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={files.length >= MAX_FILES}
          className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40 flex items-center gap-1"
        >
          📷 Add photos
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={posting || (!body.trim() && files.length === 0)}
        >
          {posting ? "Posting..." : "Post"}
        </Button>
      </div>
    </div>
  );
}
