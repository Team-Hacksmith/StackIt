'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePost } from '@/hooks/usePosts';
import { useTags } from '@/hooks/useTags';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useState } from 'react';

const postSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  body: z.string().min(20, 'Body must be at least 20 characters'),
});

type PostFormData = z.infer<typeof postSchema>;

export function CreatePostForm() {
  const router = useRouter();
  const createPost = useCreatePost();
  const { data: tags } = useTags();
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      body: '',
    },
  });

  const onSubmit = async (data: PostFormData) => {
    try {
      await createPost.mutateAsync({
        ...data,
        tag_ids: selectedTags,
      });
      router.push('/');
    } catch (error) {
      console.error('Post creation failed:', error);
    }
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Ask a Question</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="What's your programming question? Be specific." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Provide details about your question. Include what you've tried and any relevant code."
                    className="min-h-[200px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Tags</FormLabel>
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap gap-2">
                {tags?.data?.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.title}
                    {selectedTags.includes(tag.id) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <div className="text-sm text-gray-600">
                  Selected {selectedTags.length} tag(s)
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={createPost.isPending}
              className="px-8"
            >
              {createPost.isPending ? 'Publishing...' : 'Post Your Question'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
          
          {createPost.error && (
            <div className="text-red-500 text-sm">
              Failed to create post. Please try again.
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
