"use client";

import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useAcceptComment,
  useComments,
  useCreateComment,
  useVoteComment,
} from "@/hooks/useComments";
import { useMe } from "@/hooks/useMe";
import { usePost } from "@/hooks/usePosts";
import { formatDistanceToNow } from "date-fns";
import parse from "html-react-parser";
import {
  ArrowBigDown,
  ArrowBigUp,
  Check,
  Clock,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PostDetailProps {
  postId: number;
}

interface Comment {
  id: number;
  body: string;
  is_accepted: boolean;
  score: number;
  user?: {
    id: number;
    name: string;
    username: string;
    karma: number;
  };
}

export function PostDetail({ postId }: PostDetailProps) {
  const { data: post, isLoading: postLoading } = usePost(postId);
  const { data: comments, isLoading: commentsLoading } = useComments(postId);
  const { data: currentUser } = useMe();
  const createComment = useCreateComment();
  const acceptComment = useAcceptComment();
  const voteComment = useVoteComment();
  const [commentContent, setCommentContent] = useState("");

  const handleVote = async (
    commentId: number,
    voteType: "upvote" | "downvote"
  ) => {
    if (!currentUser?.data) {
      toast.error("Please login to vote");
      return;
    }

    try {
      await voteComment.mutateAsync({ commentId, voteType });
    } catch (error) {
      console.log(error);
      toast.error("Failed to vote");
    }
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) return;

    try {
      await createComment.mutateAsync({
        postId,
        data: { body: commentContent },
      });
      setCommentContent(""); // Clear the content after successful submission
    } catch (error) {
      console.log(error);
      toast.error("Failed to create comment");
    }
  };

  const handleAcceptComment = async (commentId: number) => {
    try {
      await acceptComment.mutateAsync(commentId);
    } catch (error) {
      console.log(error);
      toast.error("Failed to accept comment");
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
          {postData.user && (
            <div className="flex items-center space-x-2">
              <div>
                <div className="font-medium">@{postData.user.username}</div>
                <div className="text-sm text-gray-500">
                  {postData.user.karma || 0} reputation
                </div>
              </div>
            </div>
          )}
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
                    <span>
                      Asked {formatDistanceToNow(new Date(postData.created_at))}{" "}
                      ago
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            {/* {parse(DOMPurify.sanitize(postData.body), {
              htmlparser2: {
                lowerCaseTags: true,
                lowerCaseAttributeNames: true,
              },
              trim: true,
              replace: (domNode) => {
                if (domNode instanceof Element && domNode.attribs) {
                  // Remove any script or event handler attributes
                  Object.keys(domNode.attribs).forEach((key) => {
                    if (key.startsWith("on") || key === "src") {
                      delete domNode.attribs[key];
                    }
                  });
                  return;
                }
              },
            } as HTMLReactParserOptions)} */}
            {parse(postData.body)}
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
              <RichTextEditor
                content={commentContent}
                onChange={setCommentContent}
                minHeight="150px"
              />
              <Button
                onClick={handleSubmitComment}
                disabled={createComment.isPending}
              >
                {createComment.isPending ? "Posting..." : "Post Your Answer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments/Answers */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">
          {comments?.data?.length || 0} Answer
          {comments?.data?.length !== 1 ? "s" : ""}
        </h3>

        {commentsLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ) : (
          comments?.data?.map((comment: Comment) => (
            <Card key={comment.id}>
              <CardHeader>
                <div className="flex">
                  {/* Vote Controls */}
                  <div className="flex flex-col items-center mr-4 space-y-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleVote(comment.id, "upvote")}
                            disabled={!currentUser?.data}
                          >
                            <ArrowBigUp className="h-6 w-6" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Upvote this answer</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <span className="text-sm font-medium">{comment.score}</span>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleVote(comment.id, "downvote")}
                            disabled={!currentUser?.data}
                          >
                            <ArrowBigDown className="h-6 w-6" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Downvote this answer</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1">
                    {comment.user && (
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div>
                            <div className="font-medium text-sm">
                              @{comment.user.username}
                            </div>
                            <div className="text-xs text-gray-500">
                              {comment.user.karma || 0} reputation
                            </div>
                          </div>
                        </div>
                        {isPostAuthor && !comment.is_accepted && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAcceptComment(comment.id)}
                            disabled={acceptComment.isPending}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept Answer
                          </Button>
                        )}
                        {comment.is_accepted && (
                          <Badge
                            variant="default"
                            className="bg-green-600 text-white flex items-center"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accepted Answer
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="prose dark:prose-invert max-w-none">
                      {parse(comment.body)}
                      {/* {parse(DOMPurify.sanitize(comment.body), {
                        htmlparser2: {
                          lowerCaseTags: true,
                          lowerCaseAttributeNames: true,
                        },
                        trim: true,
                        replace: (domNode) => {
                          if (domNode instanceof Element && domNode.attribs) {
                            Object.keys(domNode.attribs).forEach((key) => {
                              if (key.startsWith("on") || key === "src") {
                                delete domNode.attribs[key];
                              }
                            });
                            return;
                          }
                        },
                      } as HTMLReactParserOptions)} */}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
