import { useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { PDFViewer } from "@react-pdf/renderer";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  selectAnalysisDetailStatus,
  selectAnalysisError,
  selectCurrentAnalysis,
} from "../../Analysis/Features/AnalysisSlice";
import { fetchAnalysisById } from "../../Analysis/Features/AnalysisThunk";
import { selectHtmlDocumentNames } from "../../Uploads/Features/HtmlDocumentsSlice";
import { fetchHtmlDocuments } from "../../Uploads/Features/HtmlDocumentsThunk";
import PDFAnalyses from "../PDFAnalyses";

// Visor del informe PDF de un análisis. Lee el :id de la ruta, carga el
// análisis (mismo patrón que AnalysisDetail) y lo renderiza en el PDFViewer.
export default function ConfigPDF() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const analysis = useAppSelector(selectCurrentAnalysis);
  const status = useAppSelector(selectAnalysisDetailStatus);
  const error = useAppSelector(selectAnalysisError);
  const documentNames = useAppSelector(selectHtmlDocumentNames);

  const numericId = Number(id);

  useEffect(() => {
    if (id) dispatch(fetchAnalysisById(numericId));
  }, [dispatch, id, numericId]);

  useEffect(() => {
    dispatch(fetchHtmlDocuments());
  }, [dispatch]);

  // Solo listo si el detalle cargado corresponde a esta ruta.
  const ready = status === "fulfilled" && analysis?.id === numericId;

  return (
    <div className="flex h-full flex-col p-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-button border border-line bg-surface px-3 py-1.5 text-caption font-semibold text-muted transition-colors hover:border-line-strong hover:text-ink"
      >
        <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Volver
      </button>

      {status === "rejected" ? (
        <div className="grid flex-1 place-items-center rounded-card border border-line-soft bg-surface text-center text-caption text-danger shadow-card">
          {error ?? "No se pudo cargar el análisis"}
        </div>
      ) : !ready || !analysis ? (
        <div className="grid flex-1 place-items-center rounded-card border border-line-soft bg-surface text-center text-caption text-subtle shadow-card">
          Generando informe…
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-hidden rounded-card border border-line-soft shadow-card">
          <PDFViewer width="100%" height="100%" showToolbar={false}>
            <PDFAnalyses
              analysis={analysis}
              fileName={documentNames[analysis.htmlId]}
            />
          </PDFViewer>
        </div>
      )}
    </div>
  );
}