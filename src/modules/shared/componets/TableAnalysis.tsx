import type { IconType } from "react-icons";
import { FiArrowRight, FiFileText, FiFolder } from "react-icons/fi";

type Tone = "success" | "warning" | "danger";

interface AnalysisRow {
  icon: IconType;
  file: string;
  meta: string;
  statusLabel: string;
  tone: Tone;
  score: number;
  errors: number;
  warnings: number;
  ok: number;
  date: string;
}

// Clases por tono del estado (literales para que Tailwind las detecte).
const TONE: Record<Tone, { badge: string; dot: string; text: string }> = {
  success: { badge: "bg-success-soft", dot: "bg-success", text: "text-success" },
  warning: { badge: "bg-warning-soft", dot: "bg-warning", text: "text-warning" },
  danger: { badge: "bg-danger-soft", dot: "bg-danger", text: "text-danger" },
};

// Datos ficticios (del diseño). Se reemplazarán por la API en la fase 3.
const rows: AnalysisRow[] = [
  {
    icon: FiFileText,
    file: "Campaña_VueltaCole.html",
    meta: "HTML individual · Pablo",
    statusLabel: "Cumplimiento alto",
    tone: "success",
    score: 94,
    errors: 0,
    warnings: 2,
    ok: 28,
    date: "Hoy, 09:42",
  },
  {
    icon: FiFolder,
    file: "BlackFriday_Lote.zip",
    meta: "12 emails · Laura",
    statusLabel: "Requiere mejoras",
    tone: "warning",
    score: 68,
    errors: 3,
    warnings: 14,
    ok: 71,
    date: "Ayer, 16:18",
  },
  {
    icon: FiFileText,
    file: "Newsletter_Julio.html",
    meta: "HTML individual · Marta",
    statusLabel: "Con observaciones",
    tone: "warning",
    score: 81,
    errors: 0,
    warnings: 6,
    ok: 24,
    date: "16 jul, 12:06",
  },
  {
    icon: FiFolder,
    file: "Lanzamiento_producto.zip",
    meta: "ZIP + imágenes · Pablo",
    statusLabel: "Accesibilidad deficiente",
    tone: "danger",
    score: 57,
    errors: 5,
    warnings: 9,
    ok: 17,
    date: "15 jul, 18:31",
  },
];

const thClass = "border-y border-line-soft py-2 font-medium";
const tdClass = "py-3 align-middle";

// Pequeña píldora de conteo de incidencias.
function Count({ value, className }: { value: number; className: string }) {
  return (
    <span
      className={`grid h-[22px] min-w-[24px] place-items-center rounded-md px-1 text-micro ${className}`}
    >
      {value}
    </span>
  );
}

export default function TableAnalysis() {
  return (
    <div className="rounded-card border border-line-soft bg-surface shadow-card h-full">
      {/* Cabecera */}
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <div>
          <h2 className="text-h2 text-ink">Últimos análisis</h2>
          <p className="mt-0.5 text-micro text-subtle">
            Resultados recientes del equipo
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-1 text-caption font-semibold text-brand-700 transition-colors hover:text-brand-500"
        >
          Ver histórico
          <FiArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Tabla */}
      <table className="w-full text-left">
        <thead>
          <tr className="bg-surface-soft text-micro text-subtle">
            <th className={`${thClass} w-full px-5`}>ARCHIVO</th>
            <th className={`${thClass} whitespace-nowrap`}>ESTADO</th>
            <th className={`${thClass} whitespace-nowrap`}>NOTA</th>
            <th className={`${thClass} whitespace-nowrap`}>INCIDENCIAS</th>
            <th className={`${thClass} whitespace-nowrap px-5 text-right`}>FECHA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {rows.map(
            ({
              icon: Icon,
              file,
              meta,
              statusLabel,
              tone,
              score,
              errors,
              warnings,
              ok,
              date,
            }) => {
              const t = TONE[tone];
              return (
                <tr
                  key={file}
                  className="transition-colors hover:bg-surface-soft"
                >
                  {/* ARCHIVO */}
                  <td className={`${tdClass} px-5`}>
                    <div className="flex items-center gap-3">
                      <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-700">
                        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-caption font-semibold text-ink">
                          {file}
                        </p>
                        <p className="mt-0.5 truncate text-micro text-subtle">
                          {meta}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* ESTADO */}
                  <td className={tdClass}>
                    <span
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-badge px-2.5 py-1 text-micro ${t.badge} ${t.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
                      {statusLabel}
                    </span>
                  </td>

                  {/* NOTA */}
                  <td className={`${tdClass} text-caption font-semibold ${t.text}`}>
                    {score}
                  </td>

                  {/* INCIDENCIAS */}
                  <td className={tdClass}>
                    <div className="flex items-center gap-1.5">
                      <Count
                        value={errors}
                        className="bg-danger-soft text-danger"
                      />
                      <Count
                        value={warnings}
                        className="bg-warning-soft text-warning"
                      />
                      <Count value={ok} className="bg-success-soft text-success" />
                    </div>
                  </td>

                  {/* FECHA */}
                  <td
                    className={`${tdClass} whitespace-nowrap px-5 text-right text-micro text-subtle`}
                  >
                    {date}
                  </td>
                </tr>
              );
            },
          )}
        </tbody>
      </table>

      {/* Pie */}
      <div className="flex items-center justify-between px-5 py-3">
        <p className="text-micro text-subtle">
          Rojo: errores · Ámbar: avisos · Verde: criterios OK
        </p>
        <p className="text-micro text-subtle">{rows.length} de 128</p>
      </div>
    </div>
  );
}
