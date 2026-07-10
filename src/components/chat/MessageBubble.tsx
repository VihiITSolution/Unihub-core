"use client";

import { FileText } from "lucide-react";
import type { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  return (
    <div
      className="flex"
      style={{ justifyContent: isOwn ? "flex-end" : "flex-start", marginBottom: 10 }}
    >
      <div
        style={{
          maxWidth: "72%",
          background: isOwn ? "var(--ink)" : "var(--soft)",
          color: isOwn ? "#fff" : "var(--ink)",
          borderRadius: 12,
          padding: "8px 12px",
        }}
      >
        {message.attachments?.map((attachment) => (
          <div key={attachment.id} style={{ marginBottom: message.body ? 8 : 0 }}>
            {attachment.fileType === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={attachment.url}
                alt={attachment.originalFilename || "attachment"}
                style={{ maxWidth: "100%", borderRadius: 8, display: "block" }}
              />
            ) : attachment.fileType === "video" ? (
              <video
                src={attachment.url}
                controls
                style={{ maxWidth: "100%", borderRadius: 8, display: "block" }}
              />
            ) : (
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: isOwn ? "#fff" : "var(--ink)",
                  textDecoration: "underline",
                  fontSize: 13,
                }}
              >
                <FileText size={16} />
                {attachment.originalFilename || "Download attachment"}
              </a>
            )}
          </div>
        ))}

        {message.body && (
          <p style={{ margin: 0, fontSize: 14, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {message.body}
          </p>
        )}

        <div
          style={{
            fontSize: 10,
            marginTop: 4,
            opacity: 0.7,
            textAlign: isOwn ? "right" : "left",
          }}
        >
          {formatTime(message.createdAt)}
          {isOwn && message.isRead ? " · Read" : ""}
        </div>
      </div>
    </div>
  );
};
