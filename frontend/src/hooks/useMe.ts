import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await axios.get("/me")
      return data
    },
  })
}