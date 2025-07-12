"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";
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
import {
  X,
  Bold,
  Italic,
  Strikethrough,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Smile,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toggle } from "../ui/toggle";

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  icon: React.ReactNode;
  tooltip: string;
}

function ToolbarButton({ onClick, active, icon, tooltip }: ToolbarButtonProps) {
  return (
    <Toggle
      type="button"
      pressed={active}
      onToggle={onClick}
      className="h-8 w-8"
      title={tooltip}
    >
      {icon}
    </Toggle>
  );
}

function EmojiPicker({ editor }: { editor: Editor }) {
  const emojis = gitHubEmojis.filter((emoji) => emoji.emoji);

  const onEmojiSelect = (emoji: { emoji: string; name: string }) => {
    const pos = editor.state.selection.from;
    editor.chain().insertContent(emoji.emoji).run();
  };

  return (
    <div className="w-[300px] max-h-[300px] overflow-y-auto p-2">
      <div className="grid grid-cols-8 gap-1">
        {emojis.map((emoji) => (
          <button
            key={emoji.name}
            onClick={() =>
              onEmojiSelect({ emoji: emoji.emoji || "", name: emoji.name })
            }
            className="p-1 hover:bg-muted rounded cursor-pointer text-lg"
            title={emoji.name}
          >
            {emoji.emoji || ""}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="border-b flex flex-wrap gap-1 p-1">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        icon={<Bold className="h-4 w-4" />}
        tooltip="Bold"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        icon={<Italic className="h-4 w-4" />}
        tooltip="Italic"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        icon={<Strikethrough className="h-4 w-4" />}
        tooltip="Strikethrough"
      />
      <ToolbarButton
        onClick={() => {
          const url = window.prompt("Enter the URL");
          if (url) {
            editor.chain().focus().toggleLink({ href: url }).run();
          }
        }}
        active={editor.isActive("link")}
        icon={<Link2 className="h-4 w-4" />}
        tooltip="Add Link"
      />
      <div className="w-px h-8 bg-border mx-1" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        icon={<List className="h-4 w-4" />}
        tooltip="Bullet List"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        icon={<ListOrdered className="h-4 w-4" />}
        tooltip="Numbered List"
      />
      <div className="w-px h-8 bg-border mx-1" />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        icon={<AlignLeft className="h-4 w-4" />}
        tooltip="Align Left"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        icon={<AlignCenter className="h-4 w-4" />}
        tooltip="Align Center"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        icon={<AlignRight className="h-4 w-4" />}
        tooltip="Align Right"
      />
      <div className="w-px h-8 bg-border mx-1" />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Add Emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <EmojiPicker editor={editor} />
        </PopoverContent>
      </Popover>
    </div>
  );
}

const postSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  body: z.string().min(20, "Body must be at least 20 characters"),
});

type PostFormData = z.infer<typeof postSchema>;

export function CreatePostForm() {
  const router = useRouter();
  const createPost = useCreatePost();
  const { data: tags } = useTags();
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        validate: (href) => /^https?:\/\//.test(href),
      }),
      Emoji.configure({
        enableEmoticons: true,
        emojis: gitHubEmojis,
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      form.setValue("body", editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none min-h-[150px]",
      },
    },
  });

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      body: "",
    },
  });

  const onSubmit = async (data: PostFormData) => {
    try {
      await createPost.mutateAsync({
        ...data,
        tag_ids: selectedTags,
      });
      router.push("/");
    } catch (error) {
      console.error("Post creation failed:", error);
    }
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
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
            render={() => (
              <FormItem>
                <FormLabel>Body</FormLabel>
                <FormControl>
                  <div
                    className="border rounded-md overflow-hidden"
                    onClick={() => editor?.chain().focus().run()}
                  >
                    <Toolbar editor={editor} />
                    <div className="p-3">
                      <EditorContent
                        editor={editor}
                        className="prose dark:prose-invert max-w-none focus:outline-none"
                      />
                    </div>
                  </div>
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
                    variant={
                      selectedTags.includes(tag.id) ? "default" : "outline"
                    }
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
              {createPost.isPending ? "Publishing..." : "Post Your Question"}
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
