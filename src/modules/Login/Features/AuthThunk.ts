import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../shared/api/apiClient";
import { clearAuth, saveAuth } from "../../shared/auth/tokenStorage";
import type {
  LoginCredentials,
  LoginResponse,
} from "../Interface/LoginInterface";

// POST /auth/login -> { token, user }. Persiste la sesión al iniciar.
export const loginThunk = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const data = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    saveAuth(data.token, data.user);
    return data;
  } catch (error) {
    const message =
      (error as { message?: string })?.message ?? "No se pudo iniciar sesión";
    return rejectWithValue(message);
  }
});

// POST /auth/logout. El JWT es stateless: aunque el servidor falle, limpiamos
// la sesión local de todas formas.
export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    // Ignorado a propósito: el cierre local no depende del servidor.
  } finally {
    clearAuth();
  }
});
