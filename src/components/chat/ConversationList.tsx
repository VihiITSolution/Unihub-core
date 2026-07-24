"use client";

import type { Conversation } from "@/types/chat";
import { Loading, Avatar } from "@/components/ui";

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: number;
  loading?: boolean;
  onSelect: (conversation: Conversation) => void;
}

const formatTimeAgo = (dateString: string | null) => {
  if (!dateString) return "";
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return new Date(dateString).toLocaleDateString();
};

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  loading,
  onSelect,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loading size="sm" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center p-8" style={{ color: "var(--muted)" }}>
        <p>No conversations yet.</p>
      </div>
    );
  }

  return (
    <div className="divide-y" style={{ borderColor: "var(--line)" }}>
      {conversations.map((conversation) => {
        const other = conversation.otherParticipant;
        const isActive = conversation.id === activeId;
        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation)}
            className="w-full text-left flex items-start gap-3 hover:bg-soft transition-colors"
            style={{
              padding: "12px 14px",
              background: isActive ? "var(--soft)" : "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Avatar src={other?.profileImage} firstName={other?.firstName} lastName={other?.lastName} size={40} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span
                  style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}
                  className="truncate"
                >
                  {other ? `${other.firstName} ${other.lastName}` : "Unknown user"}
                </span>
                <span style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>
                  {formatTimeAgo(conversation.lastMessageAt)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span
                  style={{ fontSize: 13, color: "var(--muted)" }}
                  className="truncate"
                >
                  {conversation.lastMessagePreview || "No messages yet"}
                </span>
                {conversation.unreadCount > 0 && (
                  <span
                    style={{
                      minWidth: 18,
                      height: 18,
                      padding: "0 5px",
                      borderRadius: 999,
                      background: "var(--brand)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
