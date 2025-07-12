'use client';

import { usePost } from '@/hooks/usePosts';
import { useComments, useCreateComment, useAcceptComment } from '@/hooks/useComments';
import { useMe } from '@/hooks/useMe';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, ThumbsUp, Check, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface PostDetailProps {
  postId: number;
}

export function PostDetail({ postId }: PostDetailProps) {
  const { data: post, isLoading: postLoading } = usePost(postId);
  const { data: comments, isLoading: commentsLoading } = useComments(postId);
  const { data: currentUser } = useMe();
  const createComment = useCreateComment();
  const acceptComment = useAcceptComment();
  
  const [commentBody, setCommentBody] = useState('');

  const handleSubmitComment = async () => {
    if (!commentBody.trim()) return;
    
    try {
      await createComment.mutateAsync({
        postId,
        data: { body: commentBody }
      });
      setCommentBody('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleAcceptComment = async (commentId: number) => {
    try {
      await acceptComment.mutateAsync(commentId);
    } catch (error) {
      console.error('Failed to accept comment:', error);
    }
  };

  if (postLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!post?.data) {
    return <div className="text-center py-8">Post not found.</div>;
  }

  const postData = post.data;
  const isPostAuthor = currentUser?.data?.id === postData.user_id;

  return (
    <div className="space-y-6">
      {/* Post */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{postData.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{comments?.data?.length || 0} answers</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>0 votes</span>
                </div>
                
                {postData.created_at && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Asked {formatDistanceToNow(new Date(postData.created_at))} ago</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{postData.body}</p>
          </div>
          
          {postData.tags && postData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {postData.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.title}
                </Badge>
              ))}
            </div>
          )}
          
          {postData.user && (
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  {postData.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{postData.user.username}</div>
                <div className="text-sm text-gray-500">
                  {postData.user.karma} reputation
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Answer Form */}
      {currentUser?.data && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Your Answer</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Write your answer here..."
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                className="min-h-[120px]"
              />
              <Button 
                onClick={handleSubmitComment}
                disabled={createComment.isPending || !commentBody.trim()}
              >
                {createComment.isPending ? 'Posting...' : 'Post Your Answer'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments/Answers */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">
          {comments?.data?.length || 0} Answer{comments?.data?.length !== 1 ? 's' : ''}
        </h3>
        
        {commentsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          comments?.data?.map((comment) => (
            <Card key={comment.id} className={comment.is_accepted ? 'border-green-500 bg-green-50' : ''}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="font-semibold">{comment.score}</span>
                    </div>
                    
                    {comment.is_accepted && (
                      <Badge variant="default" className="bg-green-600">
                        <Check className="w-3 h-3 mr-1" />
                        Accepted
                      </Badge>
                    )}
                  </div>
                  
                  {isPostAuthor && !comment.is_accepted && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcceptComment(comment.id)}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                  )}
                </div>
                
                <div className="prose max-w-none mb-4">
                  <p className="whitespace-pre-wrap">{comment.body}</p>
                </div>
                
                {comment.user && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {comment.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium text-sm">{comment.user.username}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {comment.user.karma} reputation
                        </span>
                      </div>
                    </div>
                    
                    {comment.created_at && (
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at))} ago
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
