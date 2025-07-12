import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsAPI } from "@/services/api";
import { useState, useEffect } from "react";

export const useNotifications = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setEnabled(!!token);
  }, []);

  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsAPI.getNotifications(),
    enabled,
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      // Invalidate notifications query to refetch
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
