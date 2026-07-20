import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import {
  FiArrowLeft,
  FiFileText,
  FiFolder,
  FiImage,
  FiLayers,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  selectCurrentUpload,
  selectUploadsDetailStatus,
  selectUploadsError,
} from "../Features/UploadsSlice";
import { fetchUploadById } from "../Features/UploadsThunk";
import type { UploadImage, UploadType } from "../Interface/UploadsInterface";

const TYPE_META: Record<UploadType, { label: string; icon: IconType }> = {
  HTML: { label: "HTML", icon: FiFileText },
  ZIP_SINGLE: { label: "ZIP simple", icon: FiFolder },
  ZIP_MULTIPLE: { label: "ZIP por lotes", icon: FiLayers },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function plural(n: number, singular: string, many: string): string {
  return `${n} ${n === 1 ? singular : many}`;
}

// Miniatura de imagen: intenta cargar la url; si falla (p. ej. ruta en disco
// no servida), cae a un icono. El badge refleja `isAccesible` del backend.
function ImageCard({ image }: { image: UploadImage }) {
  const [broken, setBroken] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-line-soft bg-surface-soft">
      <div className="flex h-28 items-center justify-center bg-canvas">
        {broken ? (
          <FiImage className="h-6 w-6 text-subtle" aria-hidden="true" />
        ) : (
          <img
            src={image.url}
            alt={image.originalName}
            onError={() => setBroken(true)}
            className="h-full w-full object-contain"
          />
        )}
      </div>
      <div className="p-2.5">
        <p
          className="truncate text-micro font-semibold text-ink"
          title={image.originalName}
        >
          {image.originalName}
        </p>
        <span
          className={`mt-1 inline-flex items-center gap-1 rounded-badge px-2 py-0.5 text-micro ${
            image.isAccesible
              ? "bg-success-soft text-success"
              : "bg-danger-soft text-danger"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              image.isAccesible ? "bg-success" : "bg-danger"
            }`}
          />
          {image.isAccesible ? "Accesible" : "No accesible"}
        </span>
      </div>
    </div>
  );
}

export default function UploadDetail() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const upload = useAppSelector(selectCurrentUpload);
  const status = useAppSelector(selectUploadsDetailStatus);
  const error = useAppSelector(selectUploadsError);

  const numericId = Number(id);

  useEffect(() => {
    if (id) dispatch(fetchUploadById(numericId));
  }, [dispatch, id, numericId]);

  // Solo se considera listo si el detalle cargado corresponde a esta ruta
  // (evita mostrar por un instante el detalle previo al navegar entre subidas).
  const ready = status === "fulfilled" && upload?.id === numericId;

  const docCount = upload?.htmlDocuments.length ?? 0;
  const imageCount =
    upload?.htmlDocuments.reduce((sum, doc) => sum + doc.images.length, 0) ?? 0;

  return (
    <div className="p-8">
      <button
        type="button"
        onClick={() => navigate("/uploads")}
        className="mb-4 inline-flex items-center gap-1.5 rounded-button border border-line bg-surface px-3 py-1.5 text-caption font-semibold text-muted transition-colors hover:border-line-strong hover:text-ink"
      >
        <FiArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Volver
      </button>

      {status === "rejected" ? (
        <div className="rounded-card border border-line-soft bg-surface p-10 text-center text-caption text-danger shadow-card">
          {error ?? "No se pudo cargar la subida"}
        </div>
      ) : !ready || !upload ? (
        <div className="rounded-card border border-line-soft bg-surface p-10 text-center text-caption text-subtle shadow-card">
          Cargando subida…
        </div>
      ) : (
        <>
          {/* Cabecera de la subida */}
          <div className="rounded-card border border-line-soft bg-surface p-5 shadow-card">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-field bg-brand-soft text-brand-700">
                {(() => {
                  const Icon = TYPE_META[upload.type].icon;
                  return <Icon className="h-5 w-5" aria-hidden="true" />;
                })()}
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-h1 text-ink">
                  {upload.originalName}
                </h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-micro text-subtle">
                  <span className="rounded-badge bg-brand-soft px-2 py-0.5 text-brand-700">
                    {TYPE_META[upload.type].label}
                  </span>
                  <span>·</span>
                  <span>{formatDate(upload.createdAt)}</span>
                  <span>·</span>
                  <span>{plural(docCount, "documento", "documentos")}</span>
                  <span>·</span>
                  <span>{plural(imageCount, "imagen", "imágenes")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Documentos HTML con su vista previa e imágenes */}
          <div className="mt-4 space-y-4">
            {upload.htmlDocuments.map((doc) => (
              <div
                key={doc.id}
                className="rounded-card border border-line-soft bg-surface p-5 shadow-card"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-h2 text-ink">{doc.name}</h2>
                    {doc.relativePath && (
                      <p className="mt-0.5 truncate text-micro text-subtle">
                        {doc.relativePath}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-badge bg-brand-soft px-2.5 py-1 text-micro text-brand-700">
                    {plural(doc.images.length, "imagen", "imágenes")}
                  </span>
                </div>

                {/* Vista previa del HTML (sandbox: sin scripts) */}
                <p className="mb-2 mt-4 text-label uppercase text-subtle">
                  Vista previa
                </p>
                <iframe
                  title={`Vista previa de ${doc.name}`}
                  srcDoc={doc.content}
                  sandbox=""
                  className="h-72 w-full rounded-xl border border-line-soft bg-white"
                />

                {/* Imágenes del documento */}
                {doc.images.length > 0 && (
                  <>
                    <p className="mb-2 mt-4 text-label uppercase text-subtle">
                      Imágenes
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {doc.images.map((image) => (
                        <ImageCard key={image.id} image={image} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
