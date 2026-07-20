import type { AuthUser } from "../../Login/Interface/LoginInterface";

// Persistencia de la sesión (JWT) en el navegador. El backend es stateless
// (ver Back Analitycs/docs 0001): el cliente guarda el token y lo envía en la
// cabecera Authorization de cada petición protegida.

const TOKEN_KEY = "analitycs.token";
const USER_KEY = "analitycs.user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
