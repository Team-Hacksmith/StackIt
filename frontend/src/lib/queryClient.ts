import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error: Error) => {
        if (isAxiosError(error)) {
          if (error?.response?.status === 401) return false;
        }
        return failureCount < 3;
      },
    },
  },
});
