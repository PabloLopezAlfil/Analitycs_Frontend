import { useMemo, useRef, useState } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiLoader,
  FiUploadCloud,
} from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  selectUploadStatus,
  selectUploadsError,
} from "../../Uploads/Features/UploadsSlice";
import { uploadFile } from "../../Uploads/Features/UploadsThunk";

const ACCEPT = ".html,.htm,.zip";

// Tarjeta de subida rápida (Quick-Upload del diseño): zona de arrastrar/soltar
// que dispara uploadFile (POST /uploads) y refleja el estado de la subida.
export default function QuickUpload() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectUploadStatus);
  const error = useAppSelector(selectUploadsError);

  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const isUploading = status === "pending";


  const view = useMemo(() => {
    switch (status) {
      case "pending":
        return {
          Icon: FiLoader,
          chip: "bg-brand-soft text-brand-700",
          title: "Subiendo…",
          desc: fileName ?? "",
        };
      case "fulfilled":
        return {
          Icon: FiCheck,
          chip: "bg-success-soft text-success",
          title: "Subida completada",
          desc: fileName ?? "",
        };
      case "rejected":
        return {
          Icon: FiAlertCircle,
          chip: "bg-danger-soft text-danger",
          title: "No se pudo subir",
          desc: "Inténtalo de nuevo",
        };
      default:
        return {
          Icon: FiUploadCloud,
          chip: "bg-brand-soft text-brand-700",
          title: "Arrastra o selecciona archivos",
          desc: "HTML, HTM o ZIP · máximo 100 MB",
        };
    }
  }, [status, fileName]);

  function handleFile(file: File | undefined) {
    if (!file || isUploading) return;
    setFileName(file.name);
    dispatch(uploadFile(file));
  }

  return (
    <div className="rounded-card border border-brand-100 bg-brand-gradient p-5 shadow-card">
      <h2 className="text-h2 text-ink">Nuevo análisis</h2>
      <p className="mt-0.5 text-micro text-subtle">
        Sube un HTML, un ZIP con recursos o un lote.
      </p>

      {/* Input real, oculto: lo dispara la zona de arrastre */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = ""; // permite volver a elegir el mismo archivo
        }}
      />

      <button
        type="button"
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFile(event.dataTransfer.files?.[0]);
        }}
        className={`mt-4 flex w-full flex-col items-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          isDragging
            ? "border-brand-500 bg-surface"
            : "border-brand-500/40 bg-surface/70 hover:border-brand-500 hover:bg-surface"
        } ${isUploading ? "cursor-wait" : "cursor-pointer"}`}
      >
        <span
          className={`grid h-11 w-11 place-items-center rounded-field ${view.chip}`}
        >
          <view.Icon
            className={`h-5 w-5 ${isUploading ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
        </span>
        <span className="mt-3 text-caption font-semibold text-ink">
          {view.title}
        </span>
        <span className="mt-1 text-micro text-subtle">{view.desc}</span>
      </button>

      {status === "rejected" && error && (
        <p role="alert" className="mt-3 text-micro text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
