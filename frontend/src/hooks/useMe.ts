import { useQuery } from "@tanstack/react-query";
import { authAPI } from "@/services/api";
import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";

export const useMe = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // This code runs only on client
    const token = localStorage.getItem("auth_token");
    setEnabled(!!token);
  }, []);

  return useQuery({
    queryKey: ["me"],
    queryFn: () => authAPI.me(),
    enabled,
    retry: false,
  });
};
