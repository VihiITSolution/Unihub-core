export interface SocialAuthor {
  id: number;
  firstName: string;
  lastName: string;
  profileImage?: string | null;
  primaryRole: string;
}

export interface PostMedia {
  url: string;
  type: 'image' | 'video';
}

export interface Post {
  id: number;
  userId: number;
  body: string | null;
  media: PostMedia[] | null;
  visibility: 'public' | 'followers';
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  createdAt: string;
  updatedAt: string;
  author: SocialAuthor;
}

export interface PostComment {
  id: number;
  postId: number;
  userId: number;
  body: string;
  createdAt: string;
  author: SocialAuthor;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FollowStatus {
  isFollowing: boolean;
  isFollowedBy: boolean;
}

export interface PublicSocialProfile {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    bio?: string | null;
    profileImage?: string | null;
    primaryRole: string;
  };
  counts: { posts: number; followers: number; following: number };
  isOwnProfile: boolean;
  isFollowing: boolean;
  isFollowedBy: boolean;
}
