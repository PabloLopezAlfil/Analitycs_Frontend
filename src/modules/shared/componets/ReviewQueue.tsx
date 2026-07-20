import type { IconType } from "react-icons";
import { FiEdit3, FiEye } from "react-icons/fi";

interface QueueItem {
  icon: IconType;
  title: string;
  meta: string;
}

// Total de pendientes (11 en el diseño); la lista muestra los primeros como
// vista previa. Datos ficticios: se conectarán a la API en la fase 3/4.
const totalPending = 11;

const items: QueueItem[] = [
  {
    icon: FiEye,
    title: "¿El banner contiene texto esencial?",
    meta: "BlackFriday_03.html · IA",
  },
  {
    icon: FiEdit3,
    title: "Validar claridad del CTA",
    meta: "Newsletter_Julio.html · Manual",
  },
];

// Cola de revisión (Review-Queue del diseño): casos pendientes de validación
// manual o por IA.
export default function ReviewQueue() {
  return (
    <div className="rounded-card border border-line-soft bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-h2 text-ink">Pendientes de revisión</h2>
        <span className="grid h-[22px] min-w-[28px] place-items-center rounded-full bg-canvas px-1.5 text-micro text-muted">
          {totalPending}
        </span>
      </div>

      <ul className="mt-4 divide-y divide-line-soft">
        {items.map(({ icon: Icon, title, meta }) => (
          <li
            key={title}
            className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ai-soft text-ai">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-caption font-semibold text-ink">{title}</p>
              <p className="mt-0.5 truncate text-micro text-subtle">{meta}</p>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-4 text-caption font-semibold text-brand-700 transition-colors hover:text-brand-500"
      >
        Revisar cola
      </button>
    </div>
  );
}
