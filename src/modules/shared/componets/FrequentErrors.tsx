import { useState } from "react";

interface ErrorStat {
  label: string;
  value: number;
}

// Datos ficticios (del diseño). Las etiquetas mapean criterios reales del
// motor de análisis (IMG_NO_ALT, contraste, CTA, tipografía, CSS). Se
// conectarán a la API en la fase 3.
const errors: ErrorStat[] = [
  { label: "Imágenes sin alt", value: 24 },
  { label: "Contraste insuficiente", value: 18 },
  { label: "CTA poco descriptivo", value: 13 },
  { label: "Fuente inferior a 14 px", value: 9 },
  { label: "CSS no compatible", value: 7 },
];

const maxValue = Math.max(...errors.map((e) => e.value));

const ranges = ["30", "90"] as const;
type Range = (typeof ranges)[number];

// Panel "Errores más frecuentes" (Frequent-Errors del diseño): barras
// horizontales con un selector de rango temporal.
export default function FrequentErrors() {
  const [range, setRange] = useState<Range>("30");

  return (
    <div className="rounded-card border border-line-soft bg-surface p-5 shadow-card">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-h2 text-ink">Errores más frecuentes</h2>
          <p className="mt-0.5 text-micro text-subtle">
            Incidencias repetidas en los últimos {range} días
          </p>
        </div>

        {/* Selector de rango */}
        <div className="flex shrink-0 items-center gap-1 rounded-field bg-canvas p-1">
          {ranges.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1 text-micro transition-colors ${
                range === r
                  ? "bg-surface text-ink shadow-sm"
                  : "text-subtle hover:text-ink"
              }`}
            >
              {r} días
            </button>
          ))}
        </div>
      </div>

      {/* Barras */}
      <div className="mt-5 space-y-3.5">
        {errors.map(({ label, value }) => (
          <div key={label} className="flex items-center gap-4">
            <span className="w-52 shrink-0 truncate text-caption text-muted">
              {label}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-line-soft">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${(value / maxValue) * 100}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-caption font-semibold text-ink">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
