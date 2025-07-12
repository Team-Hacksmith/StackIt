import apiClient from "@/lib/axios";
import {
  User,
  Post,
  Comment,
  Tag,
  Notification,
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  CreatePostRequest,
  CreateCommentRequest,
  UpdatePostRequest,
  UpdateCommentRequest,
  CreateTagRequest,
  UpdateTagRequest,
} from "@/types/api";

export const authAPI = {
  register: (data: RegisterRequest) => apiClient.post("/register", data),

  login: (data: LoginRequest) => apiClient.post<LoginResponse>("/login", data),

  logout: () => apiClient.post("/logout"),

  me: () => apiClient.get<User>("/me"),
};

export const usersAPI = {
  getUsers: () => apiClient.get<User[]>("/users"),

  getUser: (id: number) => apiClient.get<User>(`/users/${id}`),

  updateUser: (id: number, data: Partial<User>) =>
    apiClient.put<User>(`/users/${id}`, data),

  deleteUser: (id: number) => apiClient.delete(`/users/${id}`),
};

export const postsAPI = {
  getPosts: (params?: { page?: number; limit?: number; tag?: string }) =>
    apiClient.get<Post[]>("/posts", { params }),

  getPost: (id: number) => apiClient.get<Post>(`/posts/${id}`),

  createPost: (data: CreatePostRequest) => apiClient.post<Post>("/posts", data),

  updatePost: (id: number, data: UpdatePostRequest) =>
    apiClient.put<Post>(`/posts/${id}`, data),

  deletePost: (id: number) => apiClient.delete(`/posts/${id}`),
};

export const commentsAPI = {
  getComments: (postId: number) =>
    apiClient.get<Comment[]>(`/posts/${postId}/comments`),

  createComment: (postId: number, data: CreateCommentRequest) =>
    apiClient.post<Comment>(`/posts/${postId}/comments`, data),

  updateComment: (id: number, data: UpdateCommentRequest) =>
    apiClient.put<Comment>(`/comments/${id}`, data),

  deleteComment: (id: number) => apiClient.delete(`/comments/${id}`),

  acceptComment: (id: number) => apiClient.post(`/comments/${id}/accept`),
};

export const tagsAPI = {
  getTags: () => apiClient.get<Tag[]>("/tags"),

  // Admin functions
  adminCreateTag: (data: CreateTagRequest) =>
    apiClient.post<Tag>("/tags", data),

  adminUpdateTag: (id: number, data: UpdateTagRequest) =>
    apiClient.put<Tag>(`/tags/${id}`, data),

  adminDeleteTag: (id: number) => apiClient.delete(`/tags/${id}`),
};

export const notificationsAPI = {
  getNotifications: () => apiClient.get<Notification[]>("/notifications"),

  markAllAsRead: () => apiClient.post("/notifications/read_all"),
};
