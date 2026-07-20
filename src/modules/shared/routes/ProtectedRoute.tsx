import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../../../store/hooks";
import { selectIsAuthenticated } from "../../Login/Features/AuthSlice";

// Guard reutilizable para el grupo de rutas privadas. Se enchufa en main.tsx
// como layout route: si no hay sesión, redirige a /login guardando el destino
// original para volver tras autenticarse.
export default function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
