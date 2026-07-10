"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { followService } from "@/services/social.service";
import { Button } from "@/components/ui";

interface FollowButtonProps {
  userId: number;
  initialIsFollowing: boolean;
  onChange?: (isFollowing: boolean) => void;
}

export function FollowButton({ userId, initialIsFollowing, onChange }: FollowButtonProps) {
  const { token } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!token || loading) return;
    setLoading(true);
    try {
      const response = isFollowing
        ? await followService.unfollow(userId, token)
        : await followService.follow(userId, token);

      if (response.success) {
        const next = response.data?.isFollowing ?? !isFollowing;
        setIsFollowing(next);
        onChange?.(next);
      }
    } catch (error) {
      console.error("Failed to update follow status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "secondary" : "primary"}
      size="sm"
      onClick={toggle}
      disabled={loading}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
