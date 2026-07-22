import { clearAuth, getToken } from "../auth/tokenStorage";

// Cliente HTTP común contra el backend Express. La URL base se toma de la
// variable de entorno de Vite (ver .env / .env.example).
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface ApiError {
  status: number;
  message: string;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  // El JSON se marca solo si hay body y no es FormData (subidas, fase 2).
  const isFormData = options.body instanceof FormData;
  if (options.body != null && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    clearAuth();
  }

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message: string =
      payload?.error ?? payload?.message ?? `Error ${response.status}`;
    const error: ApiError = { status: response.status, message };
    throw error;
  }

  return payload as T;
}
