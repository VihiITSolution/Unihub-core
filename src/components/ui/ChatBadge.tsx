"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { chatService } from "@/services/chat.service";

export const ChatBadge: React.FC = () => {
  const { token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    const fetchUnreadCount = async () => {
      try {
        const response = await chatService.getUnreadCount(token);
        if (response.success && response.data) {
          setUnreadCount(response.data.count);
        }
      } catch (error) {
        console.error("Failed to fetch chat unread count:", error);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  if (!token) return null;

  return (
    <Link
      href="/chat"
      className="relative inline-flex h-[38px] w-[38px] items-center justify-center p-0 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer z-40"
      aria-label="Messages"
      title="Messages"
    >
      <MessageCircle size={24} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex h-[18px] min-w-[18px] items-center justify-center px-1 text-[10px] font-bold leading-none text-white bg-amber-500 rounded-full animate-pulse shadow-md">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
};
