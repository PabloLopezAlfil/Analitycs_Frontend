import type { IconType } from "react-icons";
import { FiArrowRight, FiFileText } from "react-icons/fi";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

type Tone = "success" | "warning" | "danger" | "neutral";

export interface AnalysisTableRow {
  id: string | number;
  icon?: IconType;
  file: string;
  meta?: string;
  statusLabel: string;
  tone: Tone;
  score: number | null;
  errors?: number;
  warnings?: number;
  ok?: number;
  date: string;
}

type ScoreAlign = "left" | "center" | "right";

interface TableAnalysisProps {
  title: string;
  subtitle?: string;
  rows: AnalysisTableRow[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  showAction?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  showIncidents?: boolean;
  footerInfo?: string;
  totalLabel?: string;
  documentHeader?: string;
  scoreAlign?: ScoreAlign;
}

const thClass = "border-y border-line-soft py-2 font-medium";
const tdClass = "py-3 px-5 align-middle";

// Clases por tono del estado (literales para que Tailwind las detecte).
const TONE: Record<Tone, { badge: string; dot: string; text: string }> = {
  success: { badge: "bg-success-soft", dot: "bg-success", text: "text-success" },
  warning: { badge: "bg-warning-soft", dot: "bg-warning", text: "text-warning" },
  danger: { badge: "bg-danger-soft", dot: "bg-danger", text: "text-danger" },
  neutral: { badge: "bg-surface-soft", dot: "bg-subtle", text: "text-subtle" },
};

const PROGRESS_COLOR: Record<Tone, string> = {
  success: "#2f7d5b",
  warning: "#c38724",
  danger: "#c45151",
  neutral: "#87938d",
};

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

export default function TableAnalysis({
  title,
  subtitle,
  rows,
  loading = false,
  error,
  emptyMessage = "No hay análisis para mostrar",
  showAction = false,
  actionLabel = "Ver histórico",
  onAction,
  showIncidents = false,
  footerInfo,
  totalLabel,
  documentHeader = "DOCUMENTO",
  scoreAlign = "left",
}: TableAnalysisProps) {
  const scoreAlignClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[scoreAlign];

  const hasRows = rows.length > 0;
  const emptyCellColSpan = showIncidents ? 5 : 4;

  const renderMessage = (
    message: string,
    colorClass: "text-subtle" | "text-danger" = "text-subtle",
  ) => (
    <tr>
      <td
        colSpan={emptyCellColSpan}
        className={`px-5 py-10 text-center text-caption ${colorClass}`}
      >
        {message}
      </td>
    </tr>
  );

  return (
    <div className="rounded-card border border-line-soft bg-surface shadow-card h-full">
      {/* Cabecera */}
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <div>
          <h2 className="text-h2 text-ink">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-micro text-subtle">{subtitle}</p>
          ) : null}
        </div>
        {showAction ? (
          <button
            type="button"
            onClick={onAction}
            className="flex items-center gap-1 text-caption font-semibold text-brand-700 transition-colors hover:text-brand-500"
          >
            {actionLabel}
            <FiArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {/* Tabla */}
      <table className="w-full text-left">
        <thead>
          <tr className="bg-surface-soft text-micro text-subtle">
            <th className={`${thClass} w-full px-5`}>{documentHeader}</th>
            <th className={`${thClass} whitespace-nowrap text-center`}>ESTADO</th>
            <th
              className={`${thClass} whitespace-nowrap ${
                scoreAlign === "center" ? "text-center" : ""
              }`}
            >
              NOTA
            </th>
            {showIncidents ? (
              <th className={`${thClass} whitespace-nowrap`}>INCIDENCIAS</th>
            ) : null}
            <th className={`${thClass} whitespace-nowrap px-5 text-right`}>FECHA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {loading
            ? renderMessage("Cargando análisis…")
            : error
              ? renderMessage(error, "text-danger")
              : !hasRows
                ? renderMessage(emptyMessage)
                : rows.map(
                    ({
                      id,
                      icon: Icon = FiFileText,
                      file,
                      meta,
                      statusLabel,
                      tone,
                      score,
                      errors = 0,
                      warnings = 0,
                      ok = 0,
                      date,
                    }) => {
                      const t = TONE[tone];
                      return (
                        <tr
                          key={id}
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
                                {meta ? (
                                  <p className="mt-0.5 truncate text-micro text-subtle">
                                    {meta}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </td>

                          {/* ESTADO */}
                          <td className={`${tdClass} text-center`}>
                            <span
                              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-badge px-2.5 py-1 text-micro ${t.badge} ${t.text}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
                              {statusLabel}
                            </span>
                          </td>

                          {/* NOTA */}
                          <td className={tdClass}>
                            <div className={`flex ${scoreAlignClass}`}>
                              {score === null ? (
                                <span className="text-caption font-semibold text-subtle">
                                  —
                                </span>
                              ) : (
                                <div
                                  className="h-9 w-9"
                                  role="img"
                                  aria-label={`Nota ${score} de 100`}
                                >
                                  <CircularProgressbar
                                    value={score}
                                    text={`${score}`}
                                    strokeWidth={8}
                                    styles={buildStyles({
                                      pathColor: PROGRESS_COLOR[tone],
                                      textColor: PROGRESS_COLOR[tone],
                                      trailColor: "#e8eeea",
                                      textSize: "28px",
                                      pathTransitionDuration: 0.5,
                                    })}
                                  />
                                </div>
                              )}
                            </div>
                          </td>

                          {/* INCIDENCIAS */}
                          {showIncidents ? (
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
                          ) : null}

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
          {footerInfo ??
            "La nota (0–100) resume el cumplimiento de los criterios AA."}
        </p>
        {totalLabel ? <p className="text-micro text-subtle">{totalLabel}</p> : null}
      </div>
    </div>
  );
}
