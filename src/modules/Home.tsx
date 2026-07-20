import { useAppSelector } from "../store/hooks";
import { selectCurrentUser } from "./Login/Features/AuthSlice";
import { AiOutlineMail } from "react-icons/ai";
import { GiRadarSweep } from "react-icons/gi";
import { MdErrorOutline } from "react-icons/md";
import { IoStarOutline } from "react-icons/io5";
import type { IconType } from "react-icons";
import TableAnalysis from "./shared/componets/TableAnalysis";
import QuickUpload from "./shared/componets/QuickUpload";
import ReviewQueue from "./shared/componets/ReviewQueue";

interface Metric {
  icon: IconType;
  chip: string; // clases del chip de icono (color por tipo)
  value: string;
  suffix?: string;
  label: string;
  sub: string;
  delta: string;
  deltaClass: string; // clases del badge de variación
}

// Métricas del dashboard (datos del diseño; se conectarán a la API en fase 3).
const metrics: Metric[] = [
  {
    icon: AiOutlineMail,
    chip: "bg-brand-soft text-brand-700",
    value: "128",
    label: "Emails analizados",
    sub: "20 análisis este mes",
    delta: "+18%",
    deltaClass: "bg-success-soft text-success",
  },
  {
    icon: GiRadarSweep,
    chip: "bg-success-soft text-success",
    value: "84",
    suffix: " /100",
    label: "Puntuación media",
    sub: "Cumple con observaciones",
    delta: "+4 pts",
    deltaClass: "bg-success-soft text-success",
  },
  {
    icon: MdErrorOutline,
    chip: "bg-danger-soft text-danger",
    value: "7",
    label: "Errores críticos",
    sub: "En 4 emails diferentes",
    delta: "−3",
    deltaClass: "bg-success-soft text-success",
  },
  {
    icon: IoStarOutline,
    chip: "bg-ai-soft text-ai",
    value: "11",
    label: "Revisiones pendientes",
    sub: "7 de IA · 4 manuales",
    delta: "3 nuevos",
    deltaClass: "bg-canvas text-muted",
  },
];

export default function Home() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <>
      <section className="p-8">
        <h2 className="text-h1 text-ink">
          Bienvenido{user ? `, ${user.name}` : ""}
        </h2>
        <p className="mt-2 max-w-prose text-body text-muted">
          Este es el estado de accesibilidad de los emails analizados por tu
          equipo.
        </p>
      </section>
      <section className="grid grid-cols-4 gap-4 px-8 pb-8">
        {metrics.map(
          ({ icon: Icon, chip, value, suffix, label, sub, delta, deltaClass }) => (
            <div
              key={label}
              className="rounded-card border border-line-soft bg-surface p-5 shadow-card"
            >
              <div className="flex items-start justify-between">
                <span
                  className={`grid h-9 w-9 place-items-center rounded-button ${chip}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span
                  className={`inline-flex items-center rounded-badge px-2 py-0.5 text-micro ${deltaClass}`}
                >
                  {delta}
                </span>
              </div>

              <p className="mt-4 text-metric text-ink">
                {value}
                {suffix && (
                  <span className="text-body font-normal text-subtle">
                    {suffix}
                  </span>
                )}
              </p>
              <p className="mt-1.5 text-caption text-muted">{label}</p>
              <p className="mt-0.5 text-micro text-subtle">{sub}</p>
            </div>
          ),
        )}
      </section>

      <section className="grid grid-cols-3 gap-4 px-8 pb-8">
        <div className="col-span-2 ">
          <TableAnalysis />
        </div>
        <aside className="col-span-1 space-y-4">
          <QuickUpload />
          <ReviewQueue />
        </aside>
      </section>
    </>
  );
}
