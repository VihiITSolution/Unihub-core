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
      className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer z-40"
      aria-label="Messages"
      title="Messages"
      style={{ display: "inline-flex" }}
    >
      <MessageCircle size={24} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 px-1 text-xs font-bold leading-none text-white bg-amber-500 rounded-full transform translate-x-1/2 -translate-y-1/2 animate-pulse shadow-lg">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
};
