import { FiAlertTriangle, FiX } from "react-icons/fi";
import { IoTrashOutline } from "react-icons/io5";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { selectUploadsDeleteStatus } from "../../Uploads/Features/UploadsSlice";
import { deleteUpload } from "../../Uploads/Features/UploadsThunk";

interface DeleteModalProps {
  id: number;
  uploadName: string;
  onClose: () => void;
}

export default function DeleteModal({ id, uploadName, onClose }: DeleteModalProps) {
  const dispatch = useAppDispatch();
  const deleteStatus = useAppSelector(selectUploadsDeleteStatus);
  const deleting = deleteStatus === "pending";

  async function handleDelete() {
    try {
      await dispatch(deleteUpload(id)).unwrap();
      onClose();
    } catch {
      // El error queda reflejado en selectUploadsError; el modal permanece
      // abierto para que el usuario pueda reintentar o cancelar.
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-upload-title"
    >
      <div className="w-full max-w-md rounded-card border border-line-soft bg-surface p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-field bg-danger-soft text-danger">
            <FiAlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar confirmación"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-button text-subtle transition-colors hover:bg-surface-soft hover:text-ink"
          >
            <FiX className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <h2 id="delete-upload-title" className="mt-4 text-h2 text-ink">
          ¿Eliminar esta subida?
        </h2>
        <p className="mt-2 text-caption leading-relaxed text-muted">
          Vas a eliminar <span className="font-semibold text-ink">{uploadName}</span>.
          Esta acción no se puede deshacer.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-button border border-line bg-surface px-3 py-1.5 text-caption font-semibold text-muted transition-colors hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-button bg-danger px-3 py-1.5 text-caption font-semibold text-white transition-colors hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <IoTrashOutline className="h-3.5 w-3.5" aria-hidden="true" />
            {deleting ? "Eliminando…" : "Eliminar subida"}
          </button>
        </div>
      </div>
    </div>
  );
}
