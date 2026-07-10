"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { chatService } from "@/services/chat.service";

interface ContactSupportButtonProps {
  label?: string;
  className?: string;
}

export const ContactSupportButton: React.FC<ContactSupportButtonProps> = ({
  label = "Chat with Support",
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
      const response = await chatService.createSupportConversation(token);
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
      className={
        className ||
        "inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
      }
      style={{ opacity: loading ? 0.7 : 1 }}
    >
      <MessageCircle size={18} />
      {label}
    </button>
  );
};
