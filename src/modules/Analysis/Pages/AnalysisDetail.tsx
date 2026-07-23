import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiFileText,
  FiZap,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  selectAnalysisDetailStatus,
  selectAnalysisError,
  selectAnalysisRunIAStatus,
  selectCurrentAnalysis,
} from "../Features/AnalysisSlice";
import { fetchAnalysisById, reviewAnalysisWithAi } from "../Features/AnalysisThunk";
import { selectHtmlDocumentNames } from "../../Uploads/Features/HtmlDocumentsSlice";
import { fetchHtmlDocuments } from "../../Uploads/Features/HtmlDocumentsThunk";
import type {
  AnalysisCheck,
  CheckCategory,
  CheckStatus,
} from "../Interface/AnalysisInterface";

const STATUS_META: Record<
  CheckStatus,
  { label: string; badge: string; text: string; icon: typeof FiCheckCircle }
> = {
  OK: {
    label: "Correcto",
    badge: "bg-success-soft",
    text: "text-success",
    icon: FiCheckCircle,
  },
  ERROR: {
    label: "Error",
    badge: "bg-danger-soft",
    text: "text-danger",
    icon: FiAlertCircle,
  },
  AVISO: {
    label: "Aviso",
    badge: "bg-warning-soft",
    text: "text-warning",
    icon: FiAlertCircle,
  },
  VALIDADO_IA: {
    label: "Validado por IA",
    badge: "bg-ai-soft",
    text: "text-ai",
    icon: FiCheckCircle,
  },
  REVISION_PENDIENTE: {
    label: "Pendiente de revisión",
    badge: "bg-warning-soft",
    text: "text-warning",
    icon: FiClock,
  },
};

const CATEGORY_LABEL: Record<string, string> = {
  STRUCTURE: "Estructura",
  IMAGES: "Imágenes",
  TYPOGRAPHY: "Tipografía",
  COLOR_CONTRAST: "Contraste de color",
  LINKS_BUTTONS: "Enlaces y botones",
  RESPONSIVE_CSS: "CSS responsive",
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABEL) as CheckCategory[];
type CategoryFilter = CheckCategory | "ALL" | "PENDING_AI";

// Reglas que el backend puede resolver con IA (docs 0005 §7). El resto de
// checks en REVISION_PENDIENTE requieren revisión manual y no se envían.
const AI_REVIEWABLE_RULES = new Set([
  "IMG_TEXT_IN_IMAGE",
  "IMG_GENERIC_ALT",
  "IMG_LINKED_NO_ALT",
  "IMG_EMPTY_ALT_SUSPECT",
]);

// Un check tiene trabajo pendiente para la IA si su regla es revisable y
// alguna de sus incidencias aún no tiene veredicto (idempotencia del endpoint).
function hasPendingAiWork(check: AnalysisCheck): boolean {
  return (
    AI_REVIEWABLE_RULES.has(check.rule) &&
    check.findings.some((finding) => !finding.aiStatus)
  );
}

const AI_STATUS_LABEL: Record<string, string> = {
  VALIDADO_IA: "Cumple",
  INCUMPLE: "Incumple",
  REVISION_PENDIENTE: "Sin conclusión",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusForScore(score: number | null): {
  label: string;
  tone: string;
} {
  if (score === null) return { label: "Sin puntuar", tone: "text-subtle" };
  if (score >= 90) return { label: "Cumplimiento alto", tone: "text-success" };
  if (score >= 70) return { label: "Requiere mejoras", tone: "text-warning" };
  return { label: "Accesibilidad deficiente", tone: "text-danger" };
}

function CheckCard({
  check,
  reviewing,
  onReviewWithAi,
}: {
  check: AnalysisCheck;
  reviewing: boolean;
  onReviewWithAi: () => void;
}) {
  const meta = STATUS_META[check.status];
  const Icon = meta.icon;
  const isCollapsible = check.status !== "OK";
  const [expanded, setExpanded] = useState(!isCollapsible);
  const canReviewWithAi = hasPendingAiWork(check);

  const headerContent = (
    <>
      <div className="min-w-0">
        <p className="text-micro font-semibold uppercase tracking-[0.08em] text-subtle">
          {CATEGORY_LABEL[check.category] ?? check.category}
        </p>
        <h2 className="mt-1 text-h2 text-ink">{check.rule}</h2>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-badge px-2.5 py-1 text-micro ${meta.badge} ${meta.text}`}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {meta.label}
        </span>
        {isCollapsible ? (
          expanded ? (
            <FiChevronUp className="h-4 w-4 text-subtle" aria-hidden="true" />
          ) : (
            <FiChevronDown className="h-4 w-4 text-subtle" aria-hidden="true" />
          )
        ) : null}
      </div>
    </>
  );

  return (
    <article className="rounded-card border border-line-soft bg-surface p-5 shadow-card">
      {isCollapsible ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
          className="flex w-full flex-wrap items-start justify-between gap-3 text-left"
        >
          {headerContent}
        </button>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          {headerContent}
        </div>
      )}

      {(!isCollapsible || expanded) && (
        <>
          <p className="mt-3 text-caption leading-relaxed text-muted">{check.message}</p>

          {canReviewWithAi ? (
            <button
              type="button"
              onClick={onReviewWithAi}
              disabled={reviewing}
              className="mt-4 inline-flex items-center gap-1.5 rounded-button bg-ai px-3 py-1.5 text-caption font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-60"
            >
              <FiZap className="h-3.5 w-3.5" aria-hidden="true" />
              {reviewing ? "Analizando…" : "Revisar con IA"}
            </button>
          ) : null}

          {check.findings.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-line-soft">
              <div className="bg-surface-soft px-3 py-2 text-micro font-semibold uppercase tracking-[0.08em] text-subtle">
                {check.findings.length === 1
                  ? "Incidencia encontrada"
                  : `${check.findings.length} incidencias encontradas`}
              </div>
              <div className="divide-y divide-line-soft">
                {check.findings.map((finding) => (
                  <div key={finding.id} className="space-y-2 px-3 py-3">
                    <p className="text-micro text-subtle">
                      <span className="font-semibold text-muted">Ubicación:</span>{" "}
                      {finding.location}
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-canvas p-3 text-micro leading-relaxed text-ink">
                      <code>{finding.evidence}</code>
                    </pre>

                    {finding.aiStatus ? (
                      <div className="rounded-lg border border-ai-soft bg-ai-soft px-3 py-2">
                        <p className="flex items-center gap-1.5 text-micro font-semibold text-ai">
                          <FiZap className="h-3 w-3" aria-hidden="true" />
                          Veredicto IA: {AI_STATUS_LABEL[finding.aiStatus] ?? finding.aiStatus}
                          {finding.aiConfidence
                            ? ` · confianza ${finding.aiConfidence}`
                            : ""}
                        </p>
                        {finding.aiProblem ? (
                          <p className="mt-1 text-micro text-muted">{finding.aiProblem}</p>
                        ) : null}
                        {finding.aiRecommendation ? (
                          <p className="mt-1 text-micro text-subtle">
                            <span className="font-semibold text-muted">Recomendación:</span>{" "}
                            {finding.aiRecommendation}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </article>
  );
}

export default function AnalysisDetail() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const analysis = useAppSelector(selectCurrentAnalysis);
  const status = useAppSelector(selectAnalysisDetailStatus);
  const runIAStatus = useAppSelector(selectAnalysisRunIAStatus);
  const error = useAppSelector(selectAnalysisError);
  const documentNames = useAppSelector(selectHtmlDocumentNames);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("ALL");

  const numericId = Number(id);
  const reviewing = runIAStatus === "pending";

  const handleReviewWithAi = () => {
    if (!reviewing && Number.isInteger(numericId)) {
      dispatch(reviewAnalysisWithAi(numericId));
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchAnalysisById(numericId));
    }
  }, [dispatch, id, numericId]);

  useEffect(() => {
    dispatch(fetchHtmlDocuments());
  }, [dispatch]);

  useEffect(() => {
    setSelectedCategory("ALL");
  }, [numericId]);

  const ready = status === "fulfilled" && analysis?.id === numericId;
  const scoreStatus = statusForScore(analysis?.score ?? null);
  const errorCount = analysis?.checks.filter((check) => check.status === "ERROR").length ?? 0;
  const pendingCount =
    analysis?.checks.filter((check) => check.status === "REVISION_PENDIENTE").length ?? 0;

  const availableCategories = analysis
    ? CATEGORY_ORDER.filter((category) =>
        analysis.checks.some((check) => check.category === category),
      )
    : [];
  const visibleChecks = analysis
    ? [...analysis.checks]
        .sort(
          (a, b) =>
            CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
        )
        .filter(
          (check) =>
            selectedCategory === "ALL" ||
            (selectedCategory === "PENDING_AI"
              ? check.status === "REVISION_PENDIENTE"
              : check.category === selectedCategory),
        )
    : [];

  return (
    <div className="p-8">
      <button
        type="button"
        onClick={() => navigate("/analysis")}
        className="mb-4 inline-flex items-center gap-1.5 rounded-button border border-line bg-surface px-3 py-1.5 text-caption font-semibold text-muted transition-colors hover:border-line-strong hover:text-ink"
      >
        <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Volver
      </button>

      {status === "rejected" ? (
        <div className="rounded-card border border-line-soft bg-surface p-10 text-center text-caption text-danger shadow-card">
          {error ?? "No se pudo cargar el análisis"}
        </div>
      ) : !ready || !analysis ? (
        <div className="rounded-card border border-line-soft bg-surface p-10 text-center text-caption text-subtle shadow-card">
          Cargando análisis…
        </div>
      ) : (
        <>
          <section className="rounded-card border border-line-soft bg-surface p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="flex min-w-0 items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-field bg-brand-soft text-brand-700">
                  <FiFileText className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h1 className="text-h1 text-ink">Análisis #{analysis.id}</h1>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-micro text-subtle">
                    <span>
                      {documentNames[analysis.htmlId] ?? `Documento #${analysis.htmlId}`}
                    </span>
                    <span>·</span>
                    <span>{formatDate(analysis.createdAt)}</span>
                    <span>·</span>
                    <span>{analysis.checks.length} criterios evaluados</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-micro uppercase tracking-[0.08em] text-subtle">Nota</p>
                  <p className="mt-0.5 text-metric text-ink">
                    {analysis.score === null ? "—" : analysis.score}
                    {analysis.score !== null ? (
                      <span className="text-body font-normal text-subtle">/100</span>
                    ) : null}
                  </p>
                  <p className={`text-micro ${scoreStatus.tone}`}>{scoreStatus.label}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-micro">
              <span className="rounded-badge bg-danger-soft px-2.5 py-1 text-danger">
                {errorCount} {errorCount === 1 ? "error" : "errores"}
              </span>
              <span className="rounded-badge bg-warning-soft px-2.5 py-1 text-warning">
                {pendingCount} pendientes de revisión
              </span>
            </div>

            {runIAStatus === "rejected" ? (
              <p className="mt-2 text-micro text-danger">
                {error ?? "No se pudo completar la revisión con IA"}
              </p>
            ) : null}
          </section>

          <section className="mt-4 space-y-4">
            <div>
              <h2 className="text-h2 text-ink">Criterios evaluados</h2>
              <p className="mt-0.5 text-micro text-subtle">
                Revisa el resultado de cada regla y las incidencias detectadas.
              </p>
            </div>

            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filtrar criterios por categoría"
            >
              <button
                type="button"
                aria-pressed={selectedCategory === "ALL"}
                onClick={() => setSelectedCategory("ALL")}
                className={`rounded-button border px-3 py-1.5 text-caption font-semibold transition-colors ${
                  selectedCategory === "ALL"
                    ? "border-brand-500 bg-brand-500 text-brand-900"
                    : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                Todas
              </button>
              {availableCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-button border px-3 py-1.5 text-caption font-semibold transition-colors ${
                    selectedCategory === category
                      ? "border-brand-500 bg-brand-500 text-brand-900"
                      : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
                  }`}
                >
                  {CATEGORY_LABEL[category]}
                </button>
              ))}
              {pendingCount > 0 ? (
                <button
                  type="button"
                  aria-pressed={selectedCategory === "PENDING_AI"}
                  onClick={() => setSelectedCategory("PENDING_AI")}
                  className={`rounded-button border px-3 py-1.5 text-caption font-semibold transition-colors ${
                    selectedCategory === "PENDING_AI"
                      ? "border-ai bg-ai-soft text-ai"
                      : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
                  }`}
                >
                  Pendiente de analizar por IA ({pendingCount})
                </button>
              ) : null}
            </div>

            {visibleChecks.map((check) => (
              <CheckCard
                key={check.id}
                check={check}
                reviewing={reviewing}
                onReviewWithAi={handleReviewWithAi}
              />
            ))}
          </section>
        </>
      )}
    </div>
  );
}
