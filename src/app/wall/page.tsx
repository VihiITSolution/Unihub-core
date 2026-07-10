"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { postService } from "@/services/social.service";
import { PostComposer } from "@/components/social/PostComposer";
import { PostCard } from "@/components/social/PostCard";
import { Loading } from "@/components/ui";
import type { Post } from "@/types/social";

export default function WallPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const loadFeed = useCallback(
    async (pageToLoad: number) => {
      if (!token) return;
      const response = await postService.getFeed(token, { page: pageToLoad, limit: 10 });
      if (response.success && response.data) {
        setPosts((prev) =>
          pageToLoad === 1 ? response.data!.posts : [...prev, ...response.data!.posts],
        );
        setTotalPages(response.data.pagination.totalPages);
        setPage(pageToLoad);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    loadFeed(1).finally(() => setLoading(false));
  }, [token, loadFeed]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadFeed(page + 1);
    setLoadingMore(false);
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-16">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Wall</h1>

      <PostComposer onPosted={(post) => setPosts((prev) => [post, ...prev])} />

      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p>No posts yet.</p>
          <p className="text-sm mt-1">Follow other students to see their posts here, or share something yourself.</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
          />
        ))
      )}

      {page < totalPages && (
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="text-sm text-primary-600 font-medium hover:underline disabled:opacity-40"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
