import { socialApiClient } from "@/lib/social-api-client";
import { SOCIAL_API_BASE_URL } from "@/lib/constants";
import type { ApiResponse } from "@/types";
import type {
  FollowStatus,
  Pagination,
  Post,
  PostComment,
  PublicSocialProfile,
  SocialAuthor,
} from "@/types/social";

const withPagination = (params: { page?: number; limit?: number }) => {
  const qs = new URLSearchParams();
  if (params.page) qs.append("page", params.page.toString());
  if (params.limit) qs.append("limit", params.limit.toString());
  const s = qs.toString();
  return s ? `?${s}` : "";
};

export const postService = {
  async getFeed(
    token: string,
    options?: { page?: number; limit?: number },
  ): Promise<ApiResponse<{ posts: Post[]; pagination: Pagination }>> {
    return socialApiClient.get(`/posts/feed${withPagination(options || {})}`, { token });
  },

  async getUserWall(
    userId: number,
    options?: { page?: number; limit?: number; token?: string },
  ): Promise<ApiResponse<{ posts: Post[]; pagination: Pagination }>> {
    return socialApiClient.get(`/posts/user/${userId}${withPagination(options || {})}`, {
      token: options?.token,
    });
  },

  async getPost(postId: number, token?: string): Promise<ApiResponse<{ post: Post }>> {
    return socialApiClient.get(`/posts/${postId}`, { token });
  },

  /** Multipart create - bypasses socialApiClient (always JSON-stringifies) same as chatService.sendMessage. */
  async createPost(
    token: string,
    options: { body?: string; visibility?: "public" | "followers"; files?: File[] },
  ): Promise<ApiResponse<{ post: Post }>> {
    const formData = new FormData();
    if (options.body) formData.append("body", options.body);
    if (options.visibility) formData.append("visibility", options.visibility);
    (options.files || []).forEach((file) => formData.append("media", file));

    const response = await fetch(`${SOCIAL_API_BASE_URL}/posts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  },

  async deletePost(postId: number, token: string): Promise<ApiResponse<null>> {
    return socialApiClient.delete(`/posts/${postId}`, { token });
  },

  async likePost(
    postId: number,
    token: string,
  ): Promise<ApiResponse<{ likeCount: number; liked: boolean }>> {
    return socialApiClient.post(`/posts/${postId}/like`, {}, { token });
  },

  async unlikePost(
    postId: number,
    token: string,
  ): Promise<ApiResponse<{ likeCount: number; liked: boolean }>> {
    return socialApiClient.delete(`/posts/${postId}/like`, { token });
  },

  async getComments(
    postId: number,
    options?: { page?: number; limit?: number; token?: string },
  ): Promise<ApiResponse<{ comments: PostComment[]; pagination: Pagination }>> {
    return socialApiClient.get(`/posts/${postId}/comments${withPagination(options || {})}`, {
      token: options?.token,
    });
  },

  async addComment(
    postId: number,
    body: string,
    token: string,
  ): Promise<ApiResponse<{ comment: PostComment }>> {
    return socialApiClient.post(`/posts/${postId}/comments`, { body }, { token });
  },

  async deleteComment(commentId: number, token: string): Promise<ApiResponse<null>> {
    return socialApiClient.delete(`/comments/${commentId}`, { token });
  },
};

export const followService = {
  async follow(userId: number, token: string): Promise<ApiResponse<FollowStatus>> {
    return socialApiClient.post(`/follow/${userId}`, {}, { token });
  },

  async unfollow(userId: number, token: string): Promise<ApiResponse<FollowStatus>> {
    return socialApiClient.delete(`/follow/${userId}`, { token });
  },

  async getStatus(userId: number, token: string): Promise<ApiResponse<FollowStatus>> {
    return socialApiClient.get(`/follow/${userId}/status`, { token });
  },

  async getFollowers(
    userId: number,
    options?: { page?: number; limit?: number },
  ): Promise<ApiResponse<{ users: SocialAuthor[]; pagination: Pagination }>> {
    return socialApiClient.get(`/follow/${userId}/followers${withPagination(options || {})}`);
  },

  async getFollowing(
    userId: number,
    options?: { page?: number; limit?: number },
  ): Promise<ApiResponse<{ users: SocialAuthor[]; pagination: Pagination }>> {
    return socialApiClient.get(`/follow/${userId}/following${withPagination(options || {})}`);
  },
};

export const socialProfileService = {
  async getPublicProfile(
    userId: number,
    token?: string,
  ): Promise<ApiResponse<PublicSocialProfile>> {
    return socialApiClient.get(`/profile/${userId}`, { token });
  },

  /** Multipart avatar upload - mirrors authService.uploadProfilePhoto's fetch-based pattern. */
  async uploadAvatar(
    token: string,
    file: File,
  ): Promise<ApiResponse<{ profileImage: string }>> {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch(`${SOCIAL_API_BASE_URL}/profile/picture`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  },
};
