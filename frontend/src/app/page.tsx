"use client";
import { Navbar } from "@/components/layout/Navbar";
import { PostsList } from "@/components/posts/PostsList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Questions</h1>
            <p className="text-gray-600 mt-1">
              Browse the latest questions from our community
            </p>
          </div>

          <Button asChild>
            <Link href="/posts/new">
              <Plus className="w-4 h-4 mr-2" />
              Ask Question
            </Link>
          </Button>
        </div>

        <PostsList />
      </div>
    </div>
  );
}
