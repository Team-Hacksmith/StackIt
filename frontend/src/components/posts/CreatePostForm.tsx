"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreatePost } from "@/hooks/usePosts";
import { useTags } from "@/hooks/useTags";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";
import { RichTextEditor } from "@/components/editor/RichTextEditor";

const postSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  body: z.string().min(20, "Body must be at least 20 characters"),
  tags: z
    .array(z.object({ id: z.number(), title: z.string() }))
    .min(1, "At least one tag is required"),
});

type PostFormData = z.infer<typeof postSchema>;

export function CreatePostForm() {
  const router = useRouter();
  const createPost = useCreatePost();
  const { data: tagsData } = useTags();
  const [selectedTags, setSelectedTags] = useState<
    Array<{ id: number; title: string }>
  >([]);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      body: "",
    },
  });

  const onSubmit = async (data: PostFormData) => {
    try {
      if (selectedTags.length === 0) {
        form.setError("tags", { message: "At least one tag is required" });
        return;
      }

      const tagIds = selectedTags.map((tag) => tag.id);
      const result = await createPost.mutateAsync({
        title: data.title,
        body: data.body,
        tag_ids: tagIds,
      });
      router.push(`/posts/${result.data.id}`);
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  const handleTagClick = (tag: { id: number; title: string }) => {
    if (selectedTags.some((t) => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
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
                  placeholder="What's your question?"
                  {...field}
                  className="text-lg"
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
                <RichTextEditor
                  content={field.value}
                  onChange={(html) => field.onChange(html)}
                  minHeight="300px"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium">Tags</p>
          <div className="flex flex-wrap gap-2">
            {tagsData?.data?.map((tag) => {
              const isSelected = selectedTags.some((t) => t.id === tag.id);
              return (
                <Badge
                  key={tag.id}
                  variant={isSelected ? "default" : "secondary"}
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag.title}
                  {isSelected && <X className="w-3 h-3 ml-1" />}
                </Badge>
              );
            })}
          </div>
          {form.formState.errors.tags && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.tags.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={createPost.isPending}>
          {createPost.isPending ? "Creating..." : "Post Your Question"}
        </Button>
      </form>
    </Form>
  );
}
