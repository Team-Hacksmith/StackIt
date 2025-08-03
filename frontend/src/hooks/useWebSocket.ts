"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface NotificationMessage {
  msg: string;
  unread_count: number;
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  const { data: meData } = useQuery({
    queryFn: () => {},
    queryKey: ["me"],
    enabled: false,
    retry: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token || !meData) {
      if (wsRef.current) {
        wsRef.current.close(1000, "No auth token or user data");
        wsRef.current = null;
      }
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

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

        queryClient.setQueryData<{ unread_count: number }>(
          ["notifications", "unread"],
          () => ({ unread_count: data.unread_count })
        );

        queryClient.invalidateQueries({ queryKey: ["notifications"] });

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

      if (event.code !== 1000) {
        setTimeout(() => {
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            const token = localStorage.getItem("auth_token");
            if (token && meData) {
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
  }, [queryClient, meData]);

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
