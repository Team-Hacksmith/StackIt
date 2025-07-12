import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tagsAPI } from '@/services/api';
import { CreateTagRequest, UpdateTagRequest } from '@/types/api';

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsAPI.getTags(),
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTagRequest) => tagsAPI.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTagRequest }) => 
      tagsAPI.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => tagsAPI.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};
