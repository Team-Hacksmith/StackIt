import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/services/api";
import { LoginRequest, RegisterRequest } from "@/types/api";
import { useRouter } from "next/navigation";

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authAPI.register(data),
    onSuccess: () => {
      console.log("Registration successful");
    },
    onError: (error: any) => {
      console.error("Registration failed:", error);
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authAPI.login(data),
    onSuccess: (response) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.data.access_token);
      }
      queryClient.setQueryData(["me"], response.data.user);
      router.replace("/");
    },
    onError: (error: any) => {
      console.error("Login failed:", error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
      }
      queryClient.clear();
      window.location.href = "/";
    },
  });
};
