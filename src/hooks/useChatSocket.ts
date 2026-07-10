"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "@/lib/constants";

/**
 * Lazily establishes a Socket.io connection for the chat feature. Only
 * meant to be used from /chat/* routes - not an always-on app-wide
 * provider, since nothing else in the app needs a live socket today.
 */
export function useChatSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socket = io(BACKEND_URL, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [token]);

  return { socket: socketRef.current, connected };
}
