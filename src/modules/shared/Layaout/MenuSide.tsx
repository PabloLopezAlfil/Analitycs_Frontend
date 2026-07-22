import { FaChevronDown, FaShieldAlt } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { selectCurrentUser } from "../../Login/Features/AuthSlice";
import { logoutThunk } from "../../Login/Features/AuthThunk";
import { navItems } from "../routes/navigation";

// Iniciales para el avatar (p. ej. "Pablo López" -> "PL").
function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function MenuSide() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);

  const displayName = user?.name ?? "Invitado";
  const initials = user ? initialsOf(user.name) : "?";

  async function handleLogout() {
    await dispatch(logoutThunk());
    navigate("/login", { replace: true });
  }

  return (
    <aside className="flex h-dvh w-[272px] shrink-0 flex-col overflow-y-auto border-r border-line bg-surface-soft px-4 py-5 text-ink">
      <div className="flex items-center gap-3 border-b border-line px-2 pb-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-button bg-brand-500 text-sm font-bold text-brand-900 shadow-sm">
          {initials}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-[-0.01em] text-ink">
            {displayName}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-subtle">
            Control de accesibilidad
          </p>
        </div>
      </div>

      <nav className="mt-7" aria-label="Navegación principal">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
          Espacio de trabajo
        </p>

        <div className="space-y-1.5">
          {navItems.map(({ label, href, icon: Icon }) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/"}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-button px-3 py-2.5 text-[13px] font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-brand-100 text-brand-700"
                    : "text-muted hover:bg-brand-soft hover:text-brand-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-[19px] w-[19px] shrink-0 ${
                      isActive
                        ? "text-brand-700"
                        : "text-subtle group-hover:text-brand-700"
                    }`}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="mt-auto">
        <div className="mx-1 mb-4 rounded-card border border-line bg-surface p-4">
          <div className="mb-2 flex items-center gap-2 text-brand-700">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-soft">
              <FaShieldAlt className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <h2 className="text-xs font-semibold text-ink">Entorno protegido</h2>
          </div>
          <p className="text-[10px] leading-[1.55] text-subtle">
            La IA solo recibe fragmentos imprescindibles de la información. El
            HTML completo permanece protegido.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-button border-t border-line px-2 pt-4 text-left transition-opacity hover:opacity-75"
          aria-label="Cerrar sesión"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-ink">
              {displayName}
            </span>
            <span className="mt-0.5 block text-[10px] text-subtle">
              Cerrar sesión
            </span>
          </span>
          <FaChevronDown
            className="h-2.5 w-2.5 shrink-0 text-subtle"
            aria-hidden="true"
          />
        </button>
      </div>
    </aside>
  );
}
