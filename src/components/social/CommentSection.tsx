"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { postService } from "@/services/social.service";
import { Avatar } from "@/components/ui";
import type { PostComment } from "@/types/social";

interface CommentSectionProps {
  postId: number;
  onCommentAdded?: () => void;
}

export function CommentSection({ postId, onCommentAdded }: CommentSectionProps) {
  const { token } = useAuth();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    postService.getComments(postId, { limit: 50, token: token || undefined }).then((response) => {
      if (!cancelled && response.success && response.data) {
        setComments(response.data.comments);
      }
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [postId, token]);

  const handleSubmit = async () => {
    if (!token || !newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const response = await postService.addComment(postId, newComment.trim(), token);
      if (response.success && response.data?.comment) {
        setComments((prev) => [...prev, response.data!.comment]);
        setNewComment("");
        onCommentAdded?.();
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      {loading ? (
        <p className="text-sm text-gray-400">Loading comments...</p>
      ) : (
        <div className="space-y-2 mb-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2 text-sm">
              <Avatar src={comment.author.profileImage} firstName={comment.author.firstName} lastName={comment.author.lastName} size={28} />
              <div className="bg-gray-100 rounded-2xl px-3 py-1.5 flex-1">
                <span className="font-medium text-gray-900 mr-1">
                  {comment.author.firstName} {comment.author.lastName}
                </span>
                <span className="text-gray-700">{comment.body}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {token && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Write a comment..."
            className="flex-1 text-sm border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
            className="text-sm text-primary-600 font-medium disabled:opacity-40"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
