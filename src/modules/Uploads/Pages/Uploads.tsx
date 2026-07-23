import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import {
  FiAlertCircle,
  FiCheck,
  FiEye,
  FiFileText,
  FiFolder,
  FiLayers,
  FiLoader,
  FiZap,
} from "react-icons/fi";
import { IoTrashOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { runAnalysis } from "../../Analysis/Features/AnalysisThunk";
import DeleteModal from "../../shared/components/DeleteModal";
import {
  selectUploads,
  selectUploadsError,
  selectUploadsListStatus,
} from "../Features/UploadsSlice";
import { fetchUploadById, fetchUploads } from "../Features/UploadsThunk";
import type { UploadType } from "../Interface/UploadsInterface";

// Estado del análisis por fila (una subida a la vez).
type AnalyzeState = "analyzing" | "done" | "error";

// Icono y etiqueta por tipo de subida.
const TYPE_META: Record<UploadType, { label: string; icon: IconType }> = {
  HTML: { label: "HTML", icon: FiFileText },
  ZIP_SINGLE: { label: "ZIP simple", icon: FiFolder },
  ZIP_MULTIPLE: { label: "ZIP por lotes", icon: FiLayers },
};

const ANALYZE_META: Record<
  "idle" | AnalyzeState,
  { icon: IconType; label: string }
> = {
  idle: { icon: FiZap, label: "Realizar análisis" },
  analyzing: { icon: FiLoader, label: "Analizando…" },
  done: { icon: FiCheck, label: "Analizado" },
  error: { icon: FiAlertCircle, label: "Reintentar" },
};

const thClass = "border-y border-line-soft py-2 font-medium";
const tdClass = "py-3 align-middle";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Uploads() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const uploads = useAppSelector(selectUploads);
  const status = useAppSelector(selectUploadsListStatus);
  const error = useAppSelector(selectUploadsError);

  const [analyzeState, setAnalyzeState] = useState<
    Record<number, AnalyzeState>
  >({});
  const [uploadPendingDeletion, setUploadPendingDeletion] = useState<{
    id: number;
    originalName: string;
  } | null>(null);

  useEffect(() => {
    dispatch(fetchUploads());
  }, [dispatch]);

  async function handleAnalyze(uploadId: number) {
    setAnalyzeState((prev) => ({ ...prev, [uploadId]: "analyzing" }));
    try {
      const detail = await dispatch(fetchUploadById(uploadId)).unwrap();
      if (detail.htmlDocuments.length === 0) {
        throw new Error("La subida no contiene documentos analizables");
      }
      for (const doc of detail.htmlDocuments) {
        await dispatch(runAnalysis(doc.id)).unwrap();
      }
      setAnalyzeState((prev) => ({ ...prev, [uploadId]: "done" }));
    } catch {
      setAnalyzeState((prev) => ({ ...prev, [uploadId]: "error" }));
    }
  }

  return (
    <div className="p-8">
      <button
        type="button"
        className="flex h-10 shrink-0 mb-3 items-center gap-1.5 rounded-button bg-brand-500 px-4 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-700 hover:text-white"
      >
        Volver
      </button>

      <div className="rounded-card border border-line-soft bg-surface shadow-card">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <div>
            <h2 className="text-h2 text-ink">Subidas realizadas</h2>
            <p className="mt-0.5 text-micro text-subtle">
              Emails subidos para analizar
            </p>
          </div>
          {status === "fulfilled" && (
            <span className="text-micro text-subtle">
              {uploads.length} {uploads.length === 1 ? "subida" : "subidas"}
            </span>
          )}
        </div>

        {/* Tabla */}
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-soft text-micro text-subtle">
              <th className={`${thClass} w-full px-5`}>ARCHIVO</th>
              <th className={`${thClass} whitespace-nowrap text-center`}>
                TIPO
              </th>
              <th className={`${thClass} whitespace-nowrap px-5 text-center`}>
                FECHA
              </th>
              <th
                className={`${thClass} whitespace-nowrap px-5 text-right`}
              ></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {status === "pending" && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-caption text-subtle"
                >
                  Cargando subidas…
                </td>
              </tr>
            )}

            {status === "rejected" && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-caption text-danger"
                >
                  {error ?? "No se pudieron cargar las subidas"}
                </td>
              </tr>
            )}

            {status === "fulfilled" && uploads.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-caption text-subtle"
                >
                  Aún no hay subidas. Sube un email desde el panel para empezar.
                </td>
              </tr>
            )}

            {status === "fulfilled" &&
              uploads.map(({ id, type, originalName, createdAt }) => {
                const { label, icon: Icon } = TYPE_META[type];
                return (
                  <tr
                    key={id}
                    className="transition-colors hover:bg-surface-soft"
                  >
                    {/* ARCHIVO */}
                    <td className={`${tdClass} px-5`}>
                      <div className="flex items-center gap-3">
                        <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-700">
                          <Icon
                            className="h-[18px] w-[18px]"
                            aria-hidden="true"
                          />
                        </span>
                        <p className="truncate text-caption font-semibold text-ink">
                          {originalName}
                        </p>
                      </div>
                    </td>

                    {/* TIPO */}
                    <td className={`${tdClass} text-center`}>
                      <span className="inline-flex items-center whitespace-nowrap rounded-badge bg-brand-soft px-2.5 py-1 text-micro text-brand-700">
                        {label}
                      </span>
                    </td>

                    {/* FECHA */}
                    <td
                      className={`${tdClass} whitespace-nowrap px-5 text-center text-micro text-subtle`}
                    >
                      {formatDate(createdAt)}
                    </td>

                    {/* ACCIONES */}
                    <td className={`${tdClass} px-5`}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/uploads/${id}`)}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-button border border-line bg-surface px-3 py-1.5 text-caption font-semibold text-muted transition-colors hover:border-line-strong hover:text-ink"
                        >
                          <FiEye className="h-3.5 w-3.5" aria-hidden="true" />
                          Ver detalle
                        </button>
                        {(() => {
                          const state = analyzeState[id];
                          const analyzing = state === "analyzing";
                          const { icon: ActionIcon, label } =
                            ANALYZE_META[state ?? "idle"];
                          return (
                            <button
                              type="button"
                              onClick={() => handleAnalyze(id)}
                              disabled={analyzing}
                              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-button bg-brand-500 px-3 py-1.5 text-caption font-semibold text-brand-900 transition-colors hover:bg-brand-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <ActionIcon
                                className={`h-3.5 w-3.5 ${analyzing ? "animate-spin" : ""}`}
                                aria-hidden="true"
                              />
                              {label}
                            </button>
                          );
                        })()}
                        <button
                          type="button"
                          onClick={() =>
                            setUploadPendingDeletion({ id, originalName })
                          }
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-button border border-line bg-line-strong  px-3 py-1.5 text-caption font-semibold  transition-colors hover:border-line-strong hover:text-ink"
                        >
                          <IoTrashOutline
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          Borrar datos
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {uploadPendingDeletion ? (
        <DeleteModal
          id={uploadPendingDeletion.id}
          uploadName={uploadPendingDeletion.originalName}
          onClose={() => setUploadPendingDeletion(null)}
        />
      ) : null}
    </div>
  );
}
