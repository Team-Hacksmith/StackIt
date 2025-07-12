'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usePosts } from '@/hooks/usePosts';
import { MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUp } from 'lucide-react';

export function PostsList() {
  const { data: posts, isLoading, error } = usePosts();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load posts. Please try again.</p>
      </div>
    );
  }

  if (!posts?.data?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No posts yet. Be the first to ask a question!</p>
        <Link href="/posts/new" className="text-blue-600 hover:underline mt-2 inline-block">
          Ask a question
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.data.map((post) => (
        <Card key={post.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link href={`/posts/${post.id}`}>
                  <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-gray-600 mt-1 line-clamp-2">
                  {post.body.substring(0, 150)}...
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments?.length || 0} answers</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <ArrowUp className="w-4 h-4" />
                  <span>0 votes</span>
                </div>
                
                {post.created_at && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {post.tags && post.tags.length > 0 && (
                  <div className="flex space-x-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="text-xs">
                        {tag.title}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {post.user && (
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {post.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-700">{post.user.username}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
