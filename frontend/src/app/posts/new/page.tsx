"use client";
import { CreatePostForm } from "@/components/posts/CreatePostForm";
import { useMe } from "@/hooks/useMe";
import { redirect } from "next/navigation";

export default function NewPostPage() {
  const { data: user, isLoading } = useMe();

  if (!isLoading && !user) {
    redirect("/");
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <CreatePostForm />
    </div>
  );
}
