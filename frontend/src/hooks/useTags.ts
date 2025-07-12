import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tagsAPI } from "@/services/api";
import { CreateTagRequest, UpdateTagRequest } from "@/types/api";

export const useTags = () => {
  return useQuery({
    queryKey: ["tags"],
    queryFn: () => tagsAPI.getTags(),
  });
};

export const useAdminCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTagRequest) => tagsAPI.adminCreateTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

export const useAdminUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTagRequest }) =>
      tagsAPI.adminUpdateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

export const useAdminDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tagsAPI.adminDeleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};
