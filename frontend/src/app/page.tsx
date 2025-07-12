// app/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { useMe } from "@/hooks/useMe"
import { useLogin } from "@/hooks/useLogin"
import { useLogout } from "@/hooks/useLogout"

export default function HomePage() {
  const { data: me } = useMe()
  const login = useLogin()
  const logout = useLogout()

  return (
    <div className="flex flex-col gap-4 p-4">
    jkhdkfdkfh
    </div>
  )
}
