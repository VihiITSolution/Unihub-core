"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { postService, socialProfileService, followService } from "@/services/social.service";
import { PostCard } from "@/components/social/PostCard";
import { FollowButton } from "@/components/social/FollowButton";
import { Loading } from "@/components/ui";
import type { Post, PublicSocialProfile, SocialAuthor } from "@/types/social";

type FollowListTab = "followers" | "following" | null;

export default function ProfilePage() {
  const { userId: userIdParam } = useParams<{ userId: string }>();
  const userId = Number(userIdParam);
  const { token } = useAuth();

  const [profile, setProfile] = useState<PublicSocialProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FollowListTab>(null);
  const [followList, setFollowList] = useState<SocialAuthor[]>([]);
  const [followListLoading, setFollowListLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      socialProfileService.getPublicProfile(userId, token || undefined),
      postService.getUserWall(userId, { limit: 10, token: token || undefined }),
    ]).then(([profileRes, postsRes]) => {
      if (cancelled) return;
      if (profileRes.success && profileRes.data) setProfile(profileRes.data);
      if (postsRes.success && postsRes.data) setPosts(postsRes.data.posts);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, token]);

  const openFollowList = async (tab: "followers" | "following") => {
    setActiveTab(tab);
    setFollowListLoading(true);
    const response =
      tab === "followers"
        ? await followService.getFollowers(userId, { limit: 50 })
        : await followService.getFollowing(userId, { limit: 50 });
    if (response.success && response.data) setFollowList(response.data.users);
    setFollowListLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loading />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-16 text-gray-500">User not found.</div>;
  }

  const { user, counts, isOwnProfile, isFollowing } = profile;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          {user.profileImage ? (
            <img src={user.profileImage} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200" />
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            {user.bio && <p className="text-sm text-gray-600 mt-1">{user.bio}</p>}
          </div>
          {!isOwnProfile && (
            <FollowButton userId={userId} initialIsFollowing={isFollowing} />
          )}
        </div>

        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100 text-sm">
          <span className="text-gray-600">
            <strong className="text-gray-900">{counts.posts}</strong> posts
          </span>
          <button
            type="button"
            onClick={() => openFollowList("followers")}
            className="text-gray-600 hover:text-primary-600"
          >
            <strong className="text-gray-900">{counts.followers}</strong> followers
          </button>
          <button
            type="button"
            onClick={() => openFollowList("following")}
            className="text-gray-600 hover:text-primary-600"
          >
            <strong className="text-gray-900">{counts.following}</strong> following
          </button>
        </div>
      </div>

      {activeTab && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-gray-900 capitalize">{activeTab}</h2>
            <button type="button" onClick={() => setActiveTab(null)} className="text-gray-400 hover:text-gray-600">
              ×
            </button>
          </div>
          {followListLoading ? (
            <Loading size="sm" />
          ) : followList.length === 0 ? (
            <p className="text-sm text-gray-500">No {activeTab} yet.</p>
          ) : (
            <div className="space-y-2">
              {followList.map((u) => (
                <a key={u.id} href={`/profile/${u.id}`} className="flex items-center gap-3 py-1">
                  {u.profileImage ? (
                    <img src={u.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                  )}
                  <span className="text-sm text-gray-800">
                    {u.firstName} {u.lastName}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No posts yet.</div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
          />
        ))
      )}
    </div>
  );
}
