import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsAPI } from "@/services/api";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsAPI.getNotifications(),
    enabled: window != undefined && !!localStorage.getItem("auth_token"),
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
