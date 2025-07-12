// hooks/useLogout.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"

export const useLogout = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.post("/logout")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] })
    }
  })
}
