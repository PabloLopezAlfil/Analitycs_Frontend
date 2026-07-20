import type { IconType } from "react-icons";
import { GrDocumentText } from "react-icons/gr";
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdSpaceDashboard } from "react-icons/md";
import { TbHistory } from "react-icons/tb";

export interface NavItem {
  label: string;
  href: string;
  icon: IconType;
  subtitle: string;
}

// Fuente única de la navegación: la consumen el menú lateral (MenuSide) y el
// título/subtítulo del navbar. Añadir una sección aquí la refleja en ambos.
export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: MdSpaceDashboard,
    subtitle: "Vista general del espacio de trabajo",
  },
  {
    label: "Subidas",
    href: "/uploads",
    icon: IoMdAddCircleOutline,
    subtitle: "Sube y gestiona tus emails",
  },
  {
    label: "Análisis",
    href: "/analysis",
    icon: GrDocumentText,
    subtitle: "Analiza la accesibilidad de tus emails",
  },
  {
    label: "Histórico",
    href: "/history",
    icon: TbHistory,
    subtitle: "Evolución de los análisis realizados",
  },
];

// La ruta raíz ("/") exige coincidencia exacta; el resto admite subrutas
// (p. ej. /analysis/123 sigue resolviendo a la sección "Análisis").
function matchNavItem(pathname: string): NavItem | undefined {
  return navItems.find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
  );
}

export function titleForPath(pathname: string): string {
  return matchNavItem(pathname)?.label ?? "Análisis de accesibilidad";
}

export function subtitleForPath(pathname: string): string {
  return matchNavItem(pathname)?.subtitle ?? "";
}
