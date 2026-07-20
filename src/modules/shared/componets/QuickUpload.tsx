import { FiUploadCloud } from "react-icons/fi";

// Tarjeta de subida rápida (Quick-Upload del diseño): fondo con gradiente de
// marca y una zona de arrastrar/soltar. Sin comportamiento aún (fase 2).
export default function QuickUpload() {
  return (
    <div className="rounded-card border border-brand-100 bg-brand-gradient p-5 shadow-card">
      <h2 className="text-h2 text-ink">Nuevo análisis</h2>
      <p className="mt-0.5 text-micro text-subtle">
        Sube un HTML, un ZIP con recursos o un lote.
      </p>

      <button
        type="button"
        className="mt-4 flex w-full flex-col items-center rounded-xl border-2 border-dashed border-brand-500/40 bg-surface/70 px-4 py-6 text-center transition-colors hover:border-brand-500 hover:bg-surface"
      >
        <span className="grid h-11 w-11 place-items-center rounded-field bg-brand-soft text-brand-700">
          <FiUploadCloud className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="mt-3 text-caption font-semibold text-ink">
          Arrastra o selecciona archivos
        </span>
        <span className="mt-1 text-micro text-subtle">
          HTML, HTM o ZIP · máximo 100 MB
        </span>
      </button>
    </div>
  );
}
