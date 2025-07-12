import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useRouter } from "next/navigation"

interface LoginCredentials {
  username: string
  password: string
}

export function useLogin() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.post("/auth/login", credentials)
      return data
    },
    onSuccess: (data) => {
      toast.success("Logged in successfully")
      router.push("/")
    },
    onError: (error) => {
      toast.error("Failed to login. Please check your credentials.")
    },
  })
}