import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/use-toast';

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.post('/auth/login', data),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      toast({ title: 'Welcome back!', description: `Hello, ${user.fullName}` });
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'CUSTOMER') navigate('/customer/dashboard');
      else navigate('/worker/dashboard');
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login failed';
      toast({ title: 'Login failed', description: msg, variant: 'destructive' });
    }
  });
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: { email: string; phone: string; password: string; fullName: string; role: string }) =>
      api.post('/auth/register', data),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      toast({ title: 'Account created!', description: 'Welcome to ShramSethu' });
      if (user.role === 'CUSTOMER') navigate('/customer/dashboard');
      else navigate('/worker/dashboard');
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Registration failed';
      toast({ title: 'Registration failed', description: msg, variant: 'destructive' });
    }
  });
};

export const useLogout = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  return () => {
    api.post('/auth/logout', { userId: user?.id }).catch(() => {});
    logout();
    navigate('/');
  };
};