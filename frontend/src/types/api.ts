export interface User {
  id: number;
  role: "guest" | "user" | "admin";
  name: string;
  email: string;
  username: string;
  karma: number;
}

export interface Post {
  id: number;
  user_id: number;
  title: string;
  body: string;
  created_at?: string;
  updated_at?: string;
  user?: User;
  tags?: Tag[];
  comments?: Comment[];
}

export interface Comment {
  id: number;
  user_id: number;
  post_id: number;
  body: string;
  score: number;
  is_accepted: boolean;
  created_at?: string;
  updated_at?: string;
  user?: User;
}

export interface Tag {
  id: number;
  title: string;
}

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CreatePostRequest {
  title: string;
  body: string;
  tag_ids?: number[];
}

export interface CreateCommentRequest {
  body: string;
}

export interface UpdatePostRequest {
  title?: string;
  body?: string;
  tag_ids?: number[];
}

export interface UpdateCommentRequest {
  body: string;
}

export interface CreateTagRequest {
  title: string;
}

export interface UpdateTagRequest {
  title: string;
}
