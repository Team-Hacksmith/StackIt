"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface NotificationMessage {
  msg: string;
  unread_count: number;
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    const wsUrl = `${
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"
    }/notifications/ws?token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data: NotificationMessage = JSON.parse(event.data);
        console.log("Received notification:", data);

        // Update notifications cache immediately
        queryClient.setQueryData<{ unread_count: number }>(
          ["notifications", "unread"],
          (old) => ({ unread_count: data.unread_count })
        );

        // Also invalidate to ensure full sync
        queryClient.invalidateQueries({ queryKey: ["notifications"] });

        // Show browser notification if permission granted
        if (Notification.permission === "granted") {
          new Notification("StackIt", {
            body: data.msg,
            icon: "/favicon.ico",
          });
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    ws.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);

      // Reconnect after a delay if not manually closed
      if (event.code !== 1000) {
        setTimeout(() => {
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            const token = localStorage.getItem("auth_token");
            if (token) {
              const wsUrl = `${
                process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"
              }/notifications/ws?token=${token}`;
              const newWs = new WebSocket(wsUrl);
              wsRef.current = newWs;
            }
          }
        }, 5000);
      }
    };

    ws.onerror = (error) => {
      console.log("WebSocket error:", error);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
        wsRef.current = null;
      }
    };
  }, [queryClient]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}
