import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  selectAnalyses,
  selectAnalysisError,
  selectAnalysisListStatus,
} from "../Features/AnalysisSlice";
import { fetchAnalyses } from "../Features/AnalysisThunk";
import TableAnalysis, { type AnalysisTableRow } from "../../shared/components/TableAnalysis";
import type { Analysis as AnalysisModel } from "../Interface/AnalysisInterface";

// Estado del análisis derivado del score (0-100). null = sin puntuar.
function statusForScore(score: number | null): {
  label: string;
  tone: AnalysisTableRow["tone"];
} {
  if (score === null) return { label: "Sin puntuar", tone: "neutral" };
  if (score >= 90) return { label: "Cumplimiento alto", tone: "success" };
  if (score >= 70) return { label: "Requiere mejoras", tone: "warning" };
  return { label: "Accesibilidad deficiente", tone: "danger" };
}


function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Analysis() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const analyses = useAppSelector(selectAnalyses);
  const status = useAppSelector(selectAnalysisListStatus);
  const error = useAppSelector(selectAnalysisError);

  useEffect(() => {
    dispatch(fetchAnalyses());
  }, [dispatch]);

  const rows: AnalysisTableRow[] = [...analyses]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(({ id, htmlId, score, createdAt }: AnalysisModel) => {
      const { label, tone } = statusForScore(score);
      return {
        id,
        file: `Documento #${htmlId}`,
        statusLabel: label,
        tone,
        score,
        date: formatDate(createdAt),
      };
    });

  return (
    <div className="p-8">
      <TableAnalysis
        title="Análisis realizados"
        subtitle="Histórico de análisis de accesibilidad"
        rows={rows}
        onViewDetail={(id) => navigate(`/analysis/${id}`)}
        loading={status === "idle" || status === "pending"}
        error={status === "rejected" ? error : null}
        emptyMessage="Aún no hay análisis. Lanza uno desde la sección de subidas."
        showIncidents={false}
        scoreAlign="center"
        documentHeader="DOCUMENTO"
        footerInfo="La nota (0–100) resume el cumplimiento de los criterios AA."
        totalLabel={
          status === "fulfilled"
            ? `${analyses.length} ${analyses.length === 1 ? "análisis" : "análisis"}`
            : undefined
        }
      />
    </div>
  );
}
