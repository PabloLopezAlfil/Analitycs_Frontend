import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type {
  AnalysisDetail,
  CheckCategory,
  CheckStatus,
} from "../Analysis/Interface/AnalysisInterface";

// ---------------------------------------------------------------------------
// Paleta (espejo de tailwind.tokens.cjs; react-pdf necesita hex, no clases).
// ---------------------------------------------------------------------------
const C = {
  ink: "#172126",
  muted: "#66767D",
  subtle: "#8A989E",
  canvas: "#F4F7F8",
  surface: "#FFFFFF",
  line: "#DFE7E9",
  lineSoft: "#EAF0F2",
  brand500: "#00A9CC",
  brand700: "#006D84",
  brandSoft: "#E8F9FC",
  brand900: "#06343D",
  success: "#198754",
  successSoft: "#EAF8F1",
  warning: "#8A5900",
  warningSoft: "#FFF5DF",
  danger: "#D04444",
  dangerSoft: "#FFF0F0",
  ai: "#6D5BD0",
  aiSoft: "#F0EDFF",
} as const;

const CATEGORY_LABEL: Record<CheckCategory, string> = {
  STRUCTURE: "Estructura",
  IMAGES: "Imágenes",
  TYPOGRAPHY: "Tipografía",
  COLOR_CONTRAST: "Contraste de color",
  LINKS_BUTTONS: "Enlaces y botones",
  RESPONSIVE_CSS: "CSS responsive",
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABEL) as CheckCategory[];

// Estado del check → etiqueta y color (mismos criterios que AnalysisDetail).
const STATUS_META: Record<CheckStatus, { label: string; color: string; bg: string }> = {
  OK: { label: "Correcto", color: C.success, bg: C.successSoft },
  ERROR: { label: "Error", color: C.danger, bg: C.dangerSoft },
  AVISO: { label: "Aviso", color: C.warning, bg: C.warningSoft },
  VALIDADO_IA: { label: "Validado por IA", color: C.ai, bg: C.aiSoft },
  REVISION_PENDIENTE: { label: "Pendiente", color: C.warning, bg: C.warningSoft },
};

// La severidad no es un campo del modelo: se deriva del estado del check.
const SEVERITY: Partial<Record<CheckStatus, { label: string; color: string; bg: string }>> = {
  ERROR: { label: "Alta", color: C.danger, bg: C.dangerSoft },
  AVISO: { label: "Media", color: C.warning, bg: C.warningSoft },
  REVISION_PENDIENTE: { label: "Por revisar", color: C.ai, bg: C.aiSoft },
};

const AI_STATUS_LABEL: Record<string, string> = {
  VALIDADO_IA: "Cumple",
  INCUMPLE: "Incumple",
  REVISION_PENDIENTE: "Sin conclusión",
};

// Consejo general por categoría (WCAG AA, docs 0003/0004) para la sección de
// recomendaciones cuando aún no hay veredictos de IA.
const CATEGORY_TIP: Record<CheckCategory, string> = {
  STRUCTURE:
    'Marca las tablas de maquetación con role="presentation" y evita anidamientos profundos para no confundir a los lectores de pantalla.',
  IMAGES:
    "Añade un texto alternativo (alt) descriptivo a las imágenes informativas y deja el alt vacío en las puramente decorativas.",
  TYPOGRAPHY:
    "Usa tamaños de fuente de al menos 14–16px y un interlineado ≥ 1.4 para garantizar la legibilidad.",
  COLOR_CONTRAST:
    "Asegura un contraste mínimo de 4.5:1 en texto normal y 3:1 en texto grande respecto a su fondo.",
  LINKS_BUTTONS:
    'Da a enlaces y botones un texto descriptivo (evita "haz clic aquí") y un área clicable suficiente.',
  RESPONSIVE_CSS:
    "Prioriza estilos inline y propiedades CSS compatibles con clientes de correo; evita flex/grid y fuentes externas no seguras.",
};

// Estados que se consideran incidencias (el resto —OK/VALIDADO_IA— no lo son).
const INCIDENT_STATUSES: CheckStatus[] = ["ERROR", "AVISO", "REVISION_PENDIENTE"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scoreMeta(score: number | null): { label: string; color: string } {
  if (score === null) return { label: "Sin puntuar", color: C.subtle };
  if (score >= 90) return { label: "Cumplimiento alto", color: C.success };
  if (score >= 70) return { label: "Requiere mejoras", color: C.warning };
  return { label: "Accesibilidad deficiente", color: C.danger };
}

// Colapsa espacios y recorta fragmentos largos para que quepan en la celda.
function clean(text: string, max = 320): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > max ? `${normalized.slice(0, max)}…` : normalized;
}

interface IncidentRow {
  category: CheckCategory;
  status: CheckStatus;
  location: string;
  evidence: string;
  problem: string;
  recommendation: string | null;
  aiStatus: string | null;
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 32,
    paddingTop: 36,
    paddingBottom: 48,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.muted,
    backgroundColor: C.surface,
  },

  // Cabecera
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: C.brand500,
    paddingBottom: 12,
    marginBottom: 16,
  },
  kicker: {
    fontSize: 8,
    letterSpacing: 1,
    color: C.brand700,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: { fontSize: 18, color: C.ink, fontFamily: "Helvetica-Bold" },
  fileName: { fontSize: 11, color: C.muted, marginTop: 3 },
  metaLine: { fontSize: 8.5, color: C.subtle, marginTop: 5 },

  scoreBox: { alignItems: "center", minWidth: 88 },
  scoreValue: { fontSize: 30, fontFamily: "Helvetica-Bold" },
  scoreOutOf: { fontSize: 10, color: C.subtle },
  scoreLabel: { fontSize: 7.5, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },

  // Secciones
  sectionTitle: {
    fontSize: 12,
    color: C.ink,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    marginTop: 6,
  },

  // Tarjetas de resumen (stat tiles)
  statRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  statTile: {
    flexGrow: 1,
    flexBasis: 90,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: C.canvas,
  },
  statValue: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  statLabel: { fontSize: 7.5, color: C.subtle, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.4 },

  // Resumen de errores y avisos (lista)
  summaryItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: C.lineSoft,
    paddingVertical: 6,
    gap: 8,
  },
  summaryMain: { flexGrow: 1, flexShrink: 1 },
  summaryRule: { fontSize: 9, color: C.ink, fontFamily: "Helvetica-Bold" },
  summaryMsg: { fontSize: 8.5, color: C.muted, marginTop: 2 },
  summaryCat: { fontSize: 7.5, color: C.subtle, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.4 },
  occ: { fontSize: 8, color: C.subtle, minWidth: 58, textAlign: "right" },

  // Badge genérico
  badge: {
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 5,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 7.5, fontFamily: "Helvetica-Bold" },

  // Tabla de incidencias
  table: { borderWidth: 1, borderColor: C.line, borderRadius: 6 },
  tHead: { flexDirection: "row", backgroundColor: C.brandSoft },
  tHeadCell: {
    fontSize: 7.5,
    color: C.brand700,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    padding: 5,
  },
  tRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: C.lineSoft,
  },
  cell: { padding: 5 },
  cCat: { width: 74 },
  cStatus: { width: 62 },
  cSev: { width: 56 },
  cLine: { width: 92 },
  cDetail: { flexGrow: 1, flexShrink: 1 },

  mono: { fontFamily: "Courier", fontSize: 7.5, color: C.ink },
  lineText: { fontFamily: "Courier", fontSize: 7.5, color: C.muted },
  detailLabel: {
    fontSize: 6.5,
    color: C.subtle,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginTop: 4,
  },
  detailText: { fontSize: 8, color: C.muted, marginTop: 1 },
  evidenceBox: {
    backgroundColor: C.canvas,
    borderRadius: 4,
    padding: 4,
    marginTop: 1,
  },
  aiChip: {
    flexDirection: "row",
    alignSelf: "flex-start",
    backgroundColor: C.aiSoft,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 5,
    marginTop: 4,
  },
  aiChipText: { fontSize: 7, color: C.ai, fontFamily: "Helvetica-Bold" },

  // Recomendaciones
  recItem: { flexDirection: "row", gap: 6, marginBottom: 5 },
  recBullet: { fontSize: 9, color: C.brand500, fontFamily: "Helvetica-Bold" },
  recText: { fontSize: 9, color: C.muted, flexGrow: 1, flexShrink: 1 },
  subheading: {
    fontSize: 8.5,
    color: C.ink,
    fontFamily: "Helvetica-Bold",
    marginTop: 8,
    marginBottom: 4,
  },

  emptyNote: { fontSize: 8.5, color: C.subtle, fontStyle: "italic" },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7.5,
    color: C.subtle,
    borderTopWidth: 1,
    borderTopColor: C.lineSoft,
    paddingTop: 6,
  },
});

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------
function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function StatTile({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function IncidentTableRow({ row }: { row: IncidentRow }) {
  const status = STATUS_META[row.status];
  const severity = SEVERITY[row.status];
  return (
    <View style={styles.tRow} wrap={false}>
      <View style={[styles.cell, styles.cCat]}>
        <Text style={{ color: C.ink }}>{CATEGORY_LABEL[row.category]}</Text>
      </View>
      <View style={[styles.cell, styles.cStatus]}>
        <Badge label={status.label} color={status.color} bg={status.bg} />
      </View>
      <View style={[styles.cell, styles.cSev]}>
        {severity ? (
          <Badge label={severity.label} color={severity.color} bg={severity.bg} />
        ) : (
          <Text style={{ color: C.subtle }}>—</Text>
        )}
      </View>
      <View style={[styles.cell, styles.cLine]}>
        <Text style={styles.lineText}>{clean(row.location, 80)}</Text>
      </View>
      <View style={[styles.cell, styles.cDetail]}>
        <Text style={styles.detailLabel}>Fragmento HTML</Text>
        <View style={styles.evidenceBox}>
          <Text style={styles.mono}>{clean(row.evidence, 300)}</Text>
        </View>

        <Text style={styles.detailLabel}>Problema detectado</Text>
        <Text style={styles.detailText}>{clean(row.problem, 400)}</Text>

        <Text style={styles.detailLabel}>Recomendación</Text>
        <Text style={styles.detailText}>
          {row.recommendation ? clean(row.recommendation, 400) : "—"}
        </Text>

        {row.aiStatus ? (
          <View style={styles.aiChip}>
            <Text style={styles.aiChipText}>
              Veredicto IA: {AI_STATUS_LABEL[row.aiStatus] ?? row.aiStatus}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Documento
// ---------------------------------------------------------------------------
interface PDFAnalysesProps {
  analysis: AnalysisDetail;
  /** Nombre del email/documento; el análisis solo guarda `htmlId`. */
  fileName?: string;
  /** Tipo de análisis; no es un campo del modelo, por defecto WCAG AA. */
  analysisType?: string;
}

export default function PDFAnalyses({
  analysis,
  fileName,
  analysisType = "Accesibilidad · WCAG 2.1 AA",
}: PDFAnalysesProps) {
  const checks = analysis.checks;
  const findings = checks.flatMap((check) => check.findings);

  const count = (status: CheckStatus) =>
    checks.filter((check) => check.status === status).length;
  const errorCount = count("ERROR");
  const warningCount = count("AVISO");
  const okCount = count("OK");
  const pendingCount = count("REVISION_PENDIENTE");
  const iaValidatedCount = findings.filter((f) => f.aiStatus === "VALIDADO_IA").length;

  const score = scoreMeta(analysis.score);
  const displayName = fileName ?? `Documento #${analysis.htmlId}`;

  // Resumen de errores y avisos: los checks incumplidos, errores primero.
  const errorsAndWarnings = checks
    .filter((check) => check.status === "ERROR" || check.status === "AVISO")
    .sort((a, b) => (a.status === b.status ? 0 : a.status === "ERROR" ? -1 : 1));

  // Incidencias: una fila por finding de cada check no OK (o el propio check
  // si no tiene findings concretos).
  const incidents: IncidentRow[] = checks
    .filter((check) => INCIDENT_STATUSES.includes(check.status))
    .sort(
      (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category),
    )
    .flatMap((check) =>
      check.findings.length > 0
        ? check.findings.map<IncidentRow>((finding) => ({
            category: check.category,
            status: check.status,
            location: finding.location,
            evidence: finding.evidence,
            problem: finding.aiProblem ?? check.message,
            recommendation: finding.aiRecommendation,
            aiStatus: finding.aiStatus,
          }))
        : [
            {
              category: check.category,
              status: check.status,
              location: "—",
              evidence: "—",
              problem: check.message,
              recommendation: null,
              aiStatus: null,
            },
          ],
    );

  // Recomendaciones: las de IA (si las hay) + consejos generales por categoría
  // de las que han fallado.
  const aiRecommendations = Array.from(
    new Set(
      findings
        .map((f) => f.aiRecommendation)
        .filter((r): r is string => Boolean(r)),
    ),
  );
  const failedCategories = CATEGORY_ORDER.filter((category) =>
    errorsAndWarnings.some((check) => check.category === category),
  );

  return (
    <Document
      title={`Análisis de accesibilidad — ${displayName}`}
      author="Analitycs"
    >
      <Page size="A4" style={styles.page} wrap>
        {/* Cabecera: nombre de archivo, fecha, tipo y puntuación */}
        <View style={styles.header}>
          <View style={{ flexShrink: 1, paddingRight: 12 }}>
            <Text style={styles.kicker}>Informe de análisis de accesibilidad</Text>
            <Text style={styles.title}>{displayName}</Text>
            <Text style={styles.metaLine}>
              {analysisType}  ·  Análisis #{analysis.id}
            </Text>
            <Text style={styles.metaLine}>Fecha: {formatDate(analysis.createdAt)}</Text>
          </View>
          <View style={styles.scoreBox}>
            <Text style={[styles.scoreValue, { color: score.color }]}>
              {analysis.score === null ? "—" : analysis.score}
              {analysis.score !== null ? (
                <Text style={styles.scoreOutOf}>/100</Text>
              ) : null}
            </Text>
            <Text style={[styles.scoreLabel, { color: score.color }]}>{score.label}</Text>
          </View>
        </View>

        {/* Resumen numérico */}
        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.statRow}>
          <StatTile value={errorCount} label="Errores" color={C.danger} />
          <StatTile value={warningCount} label="Avisos" color={C.warning} />
          <StatTile value={okCount} label="Puntos OK" color={C.success} />
          <StatTile value={iaValidatedCount} label="Validaciones IA" color={C.ai} />
          <StatTile value={pendingCount} label="Rev. pendientes" color={C.subtle} />
        </View>

        {/* Resumen de errores y avisos */}
        <Text style={styles.sectionTitle}>Resumen de errores y avisos</Text>
        {errorsAndWarnings.length > 0 ? (
          <View style={{ marginBottom: 18 }}>
            {errorsAndWarnings.map((check) => {
              const meta = STATUS_META[check.status];
              return (
                <View key={check.id} style={styles.summaryItem} wrap={false}>
                  <Badge label={meta.label} color={meta.color} bg={meta.bg} />
                  <View style={styles.summaryMain}>
                    <Text style={styles.summaryRule}>{check.rule}</Text>
                    <Text style={styles.summaryMsg}>{check.message}</Text>
                    <Text style={styles.summaryCat}>{CATEGORY_LABEL[check.category]}</Text>
                  </View>
                  <Text style={styles.occ}>
                    {check.findings.length}{" "}
                    {check.findings.length === 1 ? "caso" : "casos"}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={[styles.emptyNote, { marginBottom: 18 }]}>
            No se han detectado errores ni avisos.
          </Text>
        )}

        {/* Tabla de incidencias */}
        <Text style={styles.sectionTitle}>
          Tabla de incidencias{incidents.length > 0 ? ` (${incidents.length})` : ""}
        </Text>
        {incidents.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.tHead}>
              <Text style={[styles.tHeadCell, styles.cCat]}>Categoría</Text>
              <Text style={[styles.tHeadCell, styles.cStatus]}>Estado</Text>
              <Text style={[styles.tHeadCell, styles.cSev]}>Severidad</Text>
              <Text style={[styles.tHeadCell, styles.cLine]}>Línea aprox.</Text>
              <Text style={[styles.tHeadCell, styles.cDetail]}>Detalle</Text>
            </View>
            {incidents.map((row, index) => (
              <IncidentTableRow key={index} row={row} />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyNote}>No hay incidencias que mostrar.</Text>
        )}

        {/* Recomendaciones */}
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Recomendaciones</Text>
        {aiRecommendations.length === 0 && failedCategories.length === 0 ? (
          <Text style={styles.emptyNote}>
            No hay recomendaciones: el documento cumple los criterios evaluados.
          </Text>
        ) : (
          <>
            {aiRecommendations.length > 0 ? (
              <>
                <Text style={styles.subheading}>Según la revisión con IA</Text>
                {aiRecommendations.map((rec, index) => (
                  <View key={`ai-${index}`} style={styles.recItem}>
                    <Text style={styles.recBullet}>•</Text>
                    <Text style={styles.recText}>{rec}</Text>
                  </View>
                ))}
              </>
            ) : null}

            {failedCategories.length > 0 ? (
              <>
                <Text style={styles.subheading}>Buenas prácticas por categoría</Text>
                {failedCategories.map((category) => (
                  <View key={category} style={styles.recItem}>
                    <Text style={styles.recBullet}>•</Text>
                    <Text style={styles.recText}>
                      <Text style={{ fontFamily: "Helvetica-Bold", color: C.ink }}>
                        {CATEGORY_LABEL[category]}:{" "}
                      </Text>
                      {CATEGORY_TIP[category]}
                    </Text>
                  </View>
                ))}
              </>
            ) : null}
          </>
        )}

        {/* Pie con paginación */}
        <View style={styles.footer} fixed>
          <Text>Informe de accesibilidad · {displayName}</Text>
          <Text
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
