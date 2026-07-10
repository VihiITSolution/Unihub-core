"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { postService } from "@/services/social.service";
import { CommentSection } from "./CommentSection";
import type { Post } from "@/types/social";

interface PostCardProps {
  post: Post;
  onDeleted?: (postId: number) => void;
}

function timeAgo(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export function PostCard({ post, onDeleted }: PostCardProps) {
  const { user, token } = useAuth();
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [liked, setLiked] = useState(post.likedByMe);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [showComments, setShowComments] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwnPost = user && Number(user.id) === post.userId;

  const toggleLike = async () => {
    if (!token) return;
    try {
      const response = liked
        ? await postService.unlikePost(post.id, token)
        : await postService.likePost(post.id, token);
      if (response.success && response.data) {
        setLiked(response.data.liked);
        setLikeCount(response.data.likeCount);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleDelete = async () => {
    if (!token || deleting) return;
    if (!confirm("Delete this post?")) return;
    setDeleting(true);
    try {
      const response = await postService.deletePost(post.id, token);
      if (response.success) onDeleted?.(post.id);
    } catch (error) {
      console.error("Failed to delete post:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-start justify-between">
        <Link href={`/profile/${post.userId}`} className="flex items-center gap-3">
          {post.author.profileImage ? (
            <img src={post.author.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200" />
          )}
          <div>
            <p className="font-medium text-gray-900">
              {post.author.firstName} {post.author.lastName}
            </p>
            <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
          </div>
        </Link>

        {isOwnPost && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-gray-400 hover:text-red-500 text-sm"
          >
            Delete
          </button>
        )}
      </div>

      {post.body && <p className="mt-3 text-gray-800 whitespace-pre-wrap">{post.body}</p>}

      {post.media && post.media.length > 0 && (
        <div
          className={`mt-3 grid gap-1 rounded-md overflow-hidden ${
            post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {post.media.map((m, i) => (
            <img key={i} src={m.url} alt="" className="w-full max-h-96 object-cover" />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-sm">
        <button
          type="button"
          onClick={toggleLike}
          disabled={!token}
          className={`flex items-center gap-1 ${liked ? "text-primary-600" : "text-gray-600"} hover:text-primary-600`}
        >
          {liked ? "❤️" : "🤍"} {likeCount > 0 && likeCount}
        </button>
        <button
          type="button"
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1 text-gray-600 hover:text-primary-600"
        >
          💬 {commentCount > 0 && commentCount}
        </button>
      </div>

      {showComments && (
        <CommentSection postId={post.id} onCommentAdded={() => setCommentCount((c) => c + 1)} />
      )}
    </div>
  );
}
