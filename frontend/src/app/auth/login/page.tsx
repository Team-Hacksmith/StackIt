"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { useMe } from "@/hooks/useMe";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const { data: user, isLoading } = useMe();

  if (!isLoading && user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <LoginForm />
      </div>
    </div>
  );
}
