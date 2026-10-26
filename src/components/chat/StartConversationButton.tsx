"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { chatService } from "@/services/chat.service";
import type { ConversationContextType } from "@/types/chat";

interface StartConversationButtonProps {
  recipientId: number | string;
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
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (!isAuthenticated || !token) {
      router.push("/auth/login");
      return;
    }
    const parsedRecipientId = Number(recipientId);
    if (!Number.isInteger(parsedRecipientId) || parsedRecipientId < 1) {
      setError("This tutor cannot be contacted right now. Please try again later.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await chatService.createConversation(parsedRecipientId, token, {
        contextType,
        contextId,
      });
      if (response.success && response.data) {
        router.push(`/chat/${response.data.conversation.id}`);
        return;
      }
      setError(response.message || "We could not open a conversation. Please try again.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We could not open a conversation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
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
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        <MessageCircle size={16} aria-hidden="true" />
        {loading ? "Opening chat…" : label}
      </button>
      {error && <span role="alert" className="max-w-xs text-xs font-medium text-red-700">{error}</span>}
    </div>
  );
};
