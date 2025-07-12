import { useQuery } from "@tanstack/react-query";
import { authAPI } from "@/services/api";

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => authAPI.me(),
    enabled: !!localStorage.getItem("auth_token"),
    retry: false,
  });
};
