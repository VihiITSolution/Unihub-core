import type { UserRole } from "./index";

export type ConversationContextType =
  | "general"
  | "course"
  | "marketplace_item"
  | "boarding_place"
  | "support";

export interface ChatParticipant {
  id: number;
  firstName: string;
  lastName: string;
  profileImage?: string | null;
  primaryRole: UserRole;
}

export interface Conversation {
  id: number;
  contextType: ConversationContextType;
  contextId: number | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  isFlagged: boolean;
  otherParticipant: ChatParticipant | null;
  unreadCount: number;
}

export interface MessageAttachment {
  id: number;
  messageId: number;
  url: string;
  fileType: "image" | "video" | "document";
  originalFilename: string | null;
  mimeType: string | null;
  fileSizeBytes: number | null;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  body: string | null;
  messageType: "text" | "attachment" | "system";
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  sender: ChatParticipant;
  attachments: MessageAttachment[];
}

export interface ChatRejection {
  conversationId: number;
  tempId?: string;
  code: string;
  reasons: string[];
  message: string;
}
