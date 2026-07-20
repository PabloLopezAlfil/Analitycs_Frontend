import { FaRegBell } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import { IoAdd } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import { subtitleForPath, titleForPath } from "../routes/navigation";

// Barra superior de las vistas autenticadas (réplica del topbar del diseño):
// título + subtítulo de la sección a la izquierda; buscador, notificaciones y
// CTA a la derecha.
export default function Navbar() {
  const { pathname } = useLocation();
  const subtitle = subtitleForPath(pathname);

  return (
    <header className="flex h-[76px] shrink-0 items-center justify-between gap-4 border-b border-line bg-surface-alt px-9">
      {/* Sección actual */}
      <div className="min-w-0">
        <h1 className="text-h2 text-ink">{titleForPath(pathname)}</h1>
        {subtitle && (
          <p className="mt-0.5 truncate text-micro text-subtle">{subtitle}</p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3">
        {/* Buscador */}
        <div className="relative hidden md:block">
          <FiSearch
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Buscar análisis o archivo..."
            aria-label="Buscar análisis o archivo"
            className="h-10 w-64 rounded-field border border-line bg-surface pl-9 pr-12 text-sm text-ink outline-none transition-colors placeholder:text-subtle focus:border-brand-500"
          />
        </div>

        {/* Notificaciones */}
        <button
          type="button"
          aria-label="Notificaciones"
          className="relative grid h-10 w-10 shrink-0 place-items-center rounded-field border border-line bg-surface text-muted transition-colors hover:text-ink"
        >
          <FaRegBell className="h-4 w-4" aria-hidden="true" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
        </button>

        {/* CTA: nuevo análisis */}
        <button
          type="button"
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-button bg-brand-500 px-4 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-700 hover:text-white"
        >
          <IoAdd className="h-[18px] w-[18px]" aria-hidden="true" />
          Nuevo análisis
        </button>
      </div>
    </header>
  );
}
