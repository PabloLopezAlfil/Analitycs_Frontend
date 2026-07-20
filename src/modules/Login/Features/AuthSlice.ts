import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/Store";
import { getStoredUser, getToken } from "../../shared/auth/tokenStorage";
import type { AuthState } from "../Interface/LoginInterface";
import { loginThunk, logoutThunk } from "./AuthThunk";

// Estado inicial hidratado desde localStorage: si ya hay token guardado, la
// sesión se restaura al recargar la página.
const initialState: AuthState = {
  token: getToken(),
  user: getStoredUser(),
  status: "idle",
  error: undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "pending";
        state.error = undefined;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = undefined;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload ?? action.error.message;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.status = "idle";
        state.error = undefined;
      });
  },
});

export const { clearError } = authSlice.actions;

export const selectIsAuthenticated = (state: RootState): boolean =>
  Boolean(state.auth.token);
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
