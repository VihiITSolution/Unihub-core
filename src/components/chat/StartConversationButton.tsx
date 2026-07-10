"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { chatService } from "@/services/chat.service";
import type { ConversationContextType } from "@/types/chat";

interface StartConversationButtonProps {
  recipientId: number;
  contextType?: ConversationContextType;
  contextId?: number;
  label?: string;
  className?: string;
}

export const StartConversationButton: React.FC<StartConversationButtonProps> = ({
  recipientId,
  contextType = "general",
  contextId,
  label = "Message",
  className,
}) => {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated || !token) {
      router.push("/auth/login");
      return;
    }
    setLoading(true);
    try {
      const response = await chatService.createConversation(recipientId, token, {
        contextType,
        contextId,
      });
      if (response.success && response.data) {
        router.push(`/chat/${response.data.conversation.id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        border: "1.5px solid var(--ink)",
        background: "var(--ink)",
        color: "#fff",
        fontSize: 14,
        fontWeight: 700,
        borderRadius: 6,
        cursor: "pointer",
        opacity: loading ? 0.7 : 1,
      }}
    >
      <MessageCircle size={16} />
      {label}
    </button>
  );
};
