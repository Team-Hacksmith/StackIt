"use client";

import {
  useTags,
  useAdminCreateTag,
  useAdminUpdateTag,
  useAdminDeleteTag,
} from "@/hooks/useTags";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMe } from "@/hooks/useMe";

export function TagsList() {
  const { data: tags, isLoading, error } = useTags();
  const { data: user } = useMe();
  const createTag = useAdminCreateTag();
  const updateTag = useAdminUpdateTag();
  const deleteTag = useAdminDeleteTag();
  const [newTagTitle, setNewTagTitle] = useState("");
  const [editingTag, setEditingTag] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleCreateTag = async () => {
    try {
      await createTag.mutateAsync({ title: newTagTitle });
      toast.success("Tag created successfully");
      setNewTagTitle("");
      setIsCreateOpen(false);
    } catch (error) {
      toast.error("Failed to create tag");
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag) return;
    try {
      await updateTag.mutateAsync({
        id: editingTag.id,
        data: { title: editingTag.title },
      });
      toast.success("Tag updated successfully");
      setEditingTag(null);
      setIsEditOpen(false);
    } catch (error) {
      toast.error("Failed to update tag");
    }
  };

  const handleDeleteTag = async (id: number) => {
    try {
      await deleteTag.mutateAsync(id);
      toast.success("Tag deleted successfully");
    } catch (error) {
      toast.error("Failed to delete tag");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
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
        <p className="text-red-500">Failed to load tags. Please try again.</p>
      </div>
    );
  }

  if (!tags?.data?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No tags available yet.</p>
      </div>
    );
  }

  return (
    <>
      {user?.data.role === "admin" && (
        <div className="mb-6">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>Create New Tag</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Tag title"
                  value={newTagTitle}
                  onChange={(e) => setNewTagTitle(e.target.value)}
                />
                <Button
                  onClick={handleCreateTag}
                  disabled={!newTagTitle.trim()}
                >
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.data.map((tag) => (
          <Card key={tag.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-2">
              <Link href={`/?tag=${tag.title}`}>
                <Badge variant="secondary" className="mb-2 text-sm">
                  {tag.title}
                </Badge>
                <p className="text-sm text-gray-600">
                  Questions tagged with {tag.title}
                </p>
              </Link>

              {user?.data.role === "admin" && (
                <div className="flex gap-2 mt-2">
                  <Dialog
                    open={isEditOpen && editingTag?.id === tag.id}
                    onOpenChange={(open) => {
                      setIsEditOpen(open);
                      if (!open) setEditingTag(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingTag(tag)}
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Tag</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Tag title"
                          value={editingTag?.title || ""}
                          onChange={(e) =>
                            setEditingTag((prev) =>
                              prev ? { ...prev, title: e.target.value } : null
                            )
                          }
                        />
                        <Button
                          onClick={handleUpdateTag}
                          disabled={!editingTag?.title.trim()}
                        >
                          Update
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      toast.promise(handleDeleteTag(tag.id), {
                        loading: "Deleting tag...",
                        success: "Tag deleted successfully",
                        error: "Failed to delete tag",
                      });
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
