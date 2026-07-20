import { Outlet } from "react-router-dom";
import MenuSide from "./MenuSide";
import Navbar from "./Navbar";

// Estructura general de las vistas autenticadas: menú lateral fijo + barra
// superior + área de contenido (las páginas se renderizan en el <Outlet />).
export default function Layout() {
  return (
    <div className="flex min-h-dvh bg-canvas">
      <MenuSide />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
