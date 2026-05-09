import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  sub: string;
  role: string;
  id: number;
  exp: number;
}

export const getCurrentUser = (): DecodedToken | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

export const isAuthenticated = (): boolean => {
  const user = getCurrentUser();
  if (!user) return false;

  // Check if token is expired
  const now = Date.now() / 1000;
  return user.exp > now;
};