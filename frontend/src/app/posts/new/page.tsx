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
    <div className="min-h-screen bg-gray-50 max-w-screen-lg mx-auto">
      <h1 className="py-10 text-6xl font-bold">Ask a question</h1>
      <CreatePostForm />
    </div>
  );
}
