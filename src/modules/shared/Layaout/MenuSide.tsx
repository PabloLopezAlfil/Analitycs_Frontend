import type { IconType } from "react-icons";
import { FaChevronDown, FaShieldAlt } from "react-icons/fa";
import { GrDocumentText } from "react-icons/gr";
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdSpaceDashboard } from "react-icons/md";
import { TbHistory } from "react-icons/tb";

type MenuItem = {
  label: string;
  href: string;
  icon: IconType;
};

const menuItems: MenuItem[] = [
  { label: "Dashboard", href: "/home", icon: MdSpaceDashboard },
  { label: "Nuevo análisis", href: "/analitycs", icon: IoMdAddCircleOutline },
  { label: "Histórico", href: "/history", icon: TbHistory },
  { label: "Informes", href: "/docs", icon: GrDocumentText },
];

export default function MenuSide() {
  const currentPath = window.location.pathname;

  return (
    <aside className="flex h-dvh w-[272px] shrink-0 flex-col border-r border-[#e4e9e6] bg-[#f8faf8] px-4 py-5 text-[#1f2d27] shadow-[8px_0_28px_rgba(24,48,37,0.04)]">
      <div className="flex items-center gap-3 border-b border-[#e4e9e6] px-2 pb-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#153f32] text-sm font-bold text-white shadow-sm">
          PL
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-[-0.01em] text-[#17251f]">
            Pablo López
          </p>
          <p className="mt-0.5 truncate text-[11px] text-[#718078]">
            Control de accesibilidad
          </p>
        </div>
      </div>

      <nav className="mt-7" aria-label="Navegación principal">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8a9891]">
          Espacio de trabajo
        </p>

        <div className="space-y-1.5">
          {menuItems.map(({ label, href, icon: Icon }) => {
            const isActive = currentPath === href;

            return (
              <a
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-[#dcebe3] text-[#174b38]"
                    : "text-[#596860] hover:bg-[#edf2ef] hover:text-[#20352b]"
                }`}
              >
                <Icon
                  className={`h-[19px] w-[19px] shrink-0 ${
                    isActive
                      ? "text-[#1f6b4e]"
                      : "text-[#7d8b84] group-hover:text-[#37604d]"
                  }`}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </a>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto">
        <div className="mx-1 mb-4 rounded-2xl border border-[#dbe6df] bg-[#eef4f0] p-4">
          <div className="mb-2 flex items-center gap-2 text-[#285641]">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#d9e8df]">
              <FaShieldAlt className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <h2 className="text-xs font-semibold">Entorno protegido</h2>
          </div>
          <p className="text-[10px] leading-[1.55] text-[#697970]">
            La IA solo recibe fragmentos imprescindibles de la información. El
            HTML completo permanece protegido.
          </p>
        </div>

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl border-t border-[#e4e9e6] px-2 pt-4 text-left transition-opacity hover:opacity-75"
          aria-label="Abrir menú de usuario"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#dbe7df] text-xs font-bold text-[#285641]">
            PL
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-[#26352e]">
              Pablo López
            </span>
            <span className="mt-0.5 block text-[10px] text-[#87938d]">
              Administrador
            </span>
          </span>
          <FaChevronDown
            className="h-2.5 w-2.5 shrink-0 text-[#8b9791]"
            aria-hidden="true"
          />
        </button>
      </div>
    </aside>
  );
}
