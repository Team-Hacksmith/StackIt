"use client";

import { useRef } from "react";
import { type Editor, useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Emoji, { gitHubEmojis } from "@tiptap/extension-emoji";
import { uploadAPI } from "@/services/api";
import {
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
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  icon: React.ReactNode;
  tooltip: string;
  disabled?: boolean;
}

function ToolbarButton({
  onClick,
  active,
  icon,
  tooltip,
  disabled,
}: ToolbarButtonProps) {
  return (
    <Toggle
      type="button"
      pressed={active}
      onClick={onClick}
      className="h-8 w-8"
      title={tooltip}
      disabled={disabled}
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

function ImageUploader({ editor }: { editor: Editor }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleImageUpload = async (file: File) => {
    console.log(file);

    try {
      const { data } = await uploadAPI.uploadFile(file);
      console.log(data);
      if (data?.url) {
        // If the URL is relative (doesn't start with http), prepend the base URL
        const imageUrl = data.url.startsWith("http")
          ? data.url
          : `${baseURL}${data.url}`;
        editor.chain().focus().setImage({ src: imageUrl }).run();
      }
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }
      handleImageUpload(file);
    }
    // Clear the input so the same file can be selected again
    event.target.value = "";
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <ToolbarButton
        onClick={() => fileInputRef.current?.click()}
        icon={<ImageIcon className="h-4 w-4" />}
        tooltip="Upload Image"
      />
    </>
  );
}

export function Toolbar({ editor }: { editor: Editor | null }) {
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
      <ImageUploader editor={editor} />
    </div>
  );
}

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  content = "",
  onChange,
  className = "",
  minHeight = "150px",
}: RichTextEditorProps) {
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
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Emoji.configure({
        enableEmoticons: true,
        emojis: gitHubEmojis,
      }),
    ],
    content,

    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
      console.log("SDLFKJ");
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose-base dark:prose-invert focus:outline-none min-h-[${minHeight}] ${className}`,
      },
    },
  });

  return (
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
  );
}
