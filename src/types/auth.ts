export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginResponse {
  user: User;
  message: string;
}

export interface AuthError {
  message: string;
  code: string;
}
