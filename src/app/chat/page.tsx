"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { chatService } from "@/services/chat.service";
import { ConversationList } from "@/components/chat";
import type { Conversation } from "@/types/chat";

export default function ChatInboxPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      setLoading(true);
      try {
        const response = await chatService.getConversations(token);
        if (response.success && response.data) {
          setConversations(response.data.conversations);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", marginBottom: 16 }}>
        Messages
      </h1>
      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 8,
          background: "var(--white)",
          overflow: "hidden",
        }}
      >
        <ConversationList
          conversations={conversations}
          loading={loading}
          onSelect={(conversation) => router.push(`/chat/${conversation.id}`)}
        />
      </div>
    </div>
  );
}
