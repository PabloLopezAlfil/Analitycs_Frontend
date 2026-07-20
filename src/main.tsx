import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "@fontsource-variable/inter";
import Store from "./store/Store";
import "./index.css";
import Login from "./modules/Login/Page/Login";
import ProtectedRoute from "./modules/shared/routes/ProtectedRoute";
import Layout from "./modules/shared/Layaout/Layout";
import Home from "./modules/Home";
import Placeholder from "./modules/shared/Placeholder";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("No se encontró el elemento #root en el HTML.");
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={Store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route
                path="/uploads"
                element={
                  <Placeholder
                    title="Subidas"
                    description="Subida y gestión de emails (HTML, ZIP simple y ZIP por lotes). Disponible en la Fase 2."
                  />
                }
              />
              <Route
                path="/analysis"
                element={
                  <Placeholder
                    title="Análisis"
                    description="Lanzamiento y resultados de los análisis de accesibilidad. Disponible en la Fase 3."
                  />
                }
              />
              <Route
                path="/history"
                element={
                  <Placeholder
                    title="Histórico"
                    description="Histórico de análisis por documento para ver la evolución del score. Disponible en la Fase 3."
                  />
                }
              />
            </Route>
          </Route>

          {/* Cualquier otra ruta vuelve al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
