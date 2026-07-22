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
import Uploads from "./modules/Uploads/Pages/Uploads";
import UploadDetail from "./modules/Uploads/Pages/UploadDetail";
import Analysis from "./modules/Analysis/Pages/Analysis";
import AnalysisDetail from "./modules/Analysis/Pages/AnalysisDetail";
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
              <Route path="/uploads" element={<Uploads />} />
              <Route path="/uploads/:id" element={<UploadDetail />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/analysis/:id" element={<AnalysisDetail />}/>
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
