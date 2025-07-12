import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/services/api';
import { LoginRequest, RegisterRequest } from '@/types/api';

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authAPI.register(data),
    onSuccess: () => {
      console.log('Registration successful');
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: LoginRequest) => authAPI.login(data),
    onSuccess: (response) => {
      localStorage.setItem('auth_token', response.data.access_token);
      queryClient.setQueryData(['me'], response.data.user);
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      localStorage.removeItem('auth_token');
      queryClient.clear();
      window.location.href = '/';
    },
  });
};
