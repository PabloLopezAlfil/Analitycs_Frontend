// Tipos de dominio de autenticación. Reflejan el contrato del backend
// (Back Analitycs/docs 0001): POST /auth/login -> { token, user }.

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export type RequestStatus = "idle" | "pending" | "fulfilled" | "rejected";

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  status: RequestStatus;
  error?: string;
}
