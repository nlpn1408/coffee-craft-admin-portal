import { LoginResponse, User, AuthError } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthServiceError";
  }
}
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: AuthError = await response.json().catch(() => ({
      message: "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
    }));
    throw new AuthServiceError(error.message);
  }
  return response.json();
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<LoginResponse>(response);
  },

  async logout(): Promise<void> {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    return handleResponse(response);
  },

  async checkAuth(): Promise<User> {
    const response = await fetch(`${API_URL}/auth/check`, {
      credentials: "include",
    });
    return handleResponse<User>(response);
  },
};
