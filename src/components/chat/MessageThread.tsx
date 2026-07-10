"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types/chat";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Loading } from "@/components/ui";

interface MessageThreadProps {
  messages: ChatMessage[];
  currentUserId: number;
  loading?: boolean;
  otherUserTyping?: boolean;
  otherUserName?: string;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  currentUserId,
  loading,
  otherUserTyping,
  otherUserName,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, otherUserTyping]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loading size="sm" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: 16 }}>
      {messages.length === 0 ? (
        <div className="text-center" style={{ color: "var(--muted)", padding: 40 }}>
          <p>Say hello - remember, no phone numbers or emails.</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
          />
        ))
      )}
      {otherUserTyping && <TypingIndicator name={otherUserName} />}
      <div ref={bottomRef} />
    </div>
  );
};
