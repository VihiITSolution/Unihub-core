"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChatSocket } from "@/hooks/useChatSocket";
import { chatService } from "@/services/chat.service";
import { MessageThread, MessageComposer } from "@/components/chat";
import type { ChatMessage, Conversation } from "@/types/chat";

export default function ChatThreadPage() {
  const { conversationId: conversationIdParam } = useParams<{ conversationId: string }>();
  const conversationId = Number(conversationIdParam);
  const { token, user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { socket, connected } = useChatSocket(token);

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const typingClearTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!token || !conversationId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [convoRes, messagesRes] = await Promise.all([
          chatService.getConversation(conversationId, token),
          chatService.getMessages(conversationId, token),
        ]);
        if (convoRes.success && convoRes.data) setConversation(convoRes.data.conversation);
        if (messagesRes.success && messagesRes.data) setMessages(messagesRes.data.messages);
        await chatService.markRead(conversationId, token);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, conversationId]);

  useEffect(() => {
    if (!socket || !connected || !conversationId) return;

    socket.emit("conversation:join", { conversationId });

    const handleNewMessage = (data: { conversationId: number; message: ChatMessage }) => {
      if (data.conversationId !== conversationId) return;
      setMessages((prev) => [...prev, data.message]);
      setOtherUserTyping(false);
      if (data.message.senderId !== Number(user?.id)) {
        socket.emit("message:read", { conversationId });
      }
    };

    const handleRejected = (data: { conversationId: number; message: string }) => {
      if (data.conversationId !== conversationId) return;
      setSendError(data.message);
    };

    const handleTyping = (data: { conversationId: number; userId: number; isTyping: boolean }) => {
      if (data.conversationId !== conversationId || data.userId === Number(user?.id)) return;
      setOtherUserTyping(data.isTyping);
      if (typingClearTimeout.current) clearTimeout(typingClearTimeout.current);
      if (data.isTyping) {
        typingClearTimeout.current = setTimeout(() => setOtherUserTyping(false), 4000);
      }
    };

    const handleReadReceipt = (data: { conversationId: number; readerId: number }) => {
      if (data.conversationId !== conversationId) return;
      setMessages((prev) =>
        prev.map((m) => (m.senderId !== data.readerId ? { ...m, isRead: true } : m)),
      );
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:rejected", handleRejected);
    socket.on("typing:update", handleTyping);
    socket.on("message:read", handleReadReceipt);

    return () => {
      socket.emit("conversation:leave", { conversationId });
      socket.off("message:new", handleNewMessage);
      socket.off("message:rejected", handleRejected);
      socket.off("typing:update", handleTyping);
      socket.off("message:read", handleReadReceipt);
    };
  }, [socket, connected, conversationId, user?.id]);

  const handleSend = async (body: string, files: File[]) => {
    if (!token) return;
    setSendError(null);

    if (files.length > 0 || !connected || !socket) {
      const response = await chatService.sendMessage(conversationId, token, { body, files });
      if (!response.success) {
        setSendError(response.message || "Failed to send message.");
        return;
      }
      if (!connected && response.data) {
        setMessages((prev) => [...prev, response.data!.message]);
      }
      return;
    }

    socket.emit("message:send", {
      conversationId,
      body,
      tempId: Date.now().toString(),
    });
  };

  const other = conversation?.otherParticipant;

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          border: "1px solid var(--line)",
          borderBottom: "none",
          borderRadius: "8px 8px 0 0",
          padding: "12px 14px",
          background: "var(--white)",
        }}
      >
        <button
          onClick={() => router.push("/chat")}
          style={{ border: "none", background: "none", cursor: "pointer", display: "flex" }}
          aria-label="Back to inbox"
        >
          <ArrowLeft size={20} />
        </button>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "var(--brand)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 800,
            display: "grid",
            placeItems: "center",
          }}
        >
          {other ? `${other.firstName?.[0] ?? ""}${other.lastName?.[0] ?? ""}` : "?"}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
            {other ? `${other.firstName} ${other.lastName}` : "Conversation"}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "capitalize" }}>
            {other?.primaryRole}
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          border: "1px solid var(--line)",
          borderRadius: "0 0 8px 8px",
          background: "var(--white)",
          overflow: "hidden",
        }}
      >
        <MessageThread
          messages={messages}
          currentUserId={Number(user?.id)}
          loading={loading}
          otherUserTyping={otherUserTyping}
          otherUserName={other?.firstName}
        />

        {sendError && (
          <div
            style={{
              fontSize: 13,
              color: "#b91c1c",
              background: "#fef2f2",
              borderTop: "1px solid #fecaca",
              padding: "8px 14px",
            }}
          >
            {sendError}
          </div>
        )}

        <MessageComposer
          onSend={handleSend}
          onTypingStart={() => socket?.emit("typing:start", { conversationId })}
          onTypingStop={() => socket?.emit("typing:stop", { conversationId })}
        />
      </div>
    </div>
  );
}
