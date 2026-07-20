import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  clearError,
  selectAuthError,
  selectAuthStatus,
  selectIsAuthenticated,
} from "../Features/AuthSlice";
import { loginThunk } from "../Features/AuthThunk";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Destino al que volver tras autenticarse (lo deja ProtectedRoute).
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  // Limpia el error previo al desmontar la pantalla.
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const isSubmitting = status === "pending";

  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-card border border-line bg-surface p-8 shadow-strong">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 grid h-12 w-12 place-items-center rounded-button bg-brand-500 text-brand-900">
            <FaShieldAlt className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="text-h1 text-ink">Iniciar sesión</h1>
          <p className="mt-1 text-caption text-muted">
            Análisis de accesibilidad AA para emails HTML
          </p>
        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const result = await dispatch(loginThunk({ email, password }));
            if (loginThunk.fulfilled.match(result)) {
              navigate(from, { replace: true });
            }
          }}
          className="space-y-4"
          noValidate
        >
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-caption text-ink"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-field border border-line bg-surface-soft px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-500 focus:bg-surface"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-caption text-ink"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-field border border-line bg-surface-soft px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-500 focus:bg-surface"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-danger-soft px-3 py-2 text-caption text-danger"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-button bg-brand-500 px-4 py-2.5 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
