import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../shared/api/apiClient";
import type { Upload, UploadDetail } from "../Interface/UploadsInterface";

// Extrae un mensaje legible del error del cliente HTTP (ver apiClient).
function toMessage(error: unknown, fallback: string): string {
  return (error as { message?: string })?.message ?? fallback;
}

// POST /uploads — sube un archivo (HTML o ZIP) como multipart/form-data. El
// backend detecta el tipo, procesa y persiste; devuelve la subida creada con
// sus documentos e imágenes ya procesados. El apiClient no fija Content-Type
// para FormData (deja que el navegador ponga el boundary).
export const uploadFile = createAsyncThunk<
  UploadDetail,
  File,
  { rejectValue: string }
>("uploads/uploadFile", async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    return await apiFetch<UploadDetail>("/uploads", {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    return rejectWithValue(toMessage(error, "No se pudo subir el archivo"));
  }
});

// GET /uploads — listado resumido de subidas.
export const fetchUploads = createAsyncThunk<
  Upload[],
  void,
  { rejectValue: string }
>("uploads/fetchUploads", async (_, { rejectWithValue }) => {
  try {
    return await apiFetch<Upload[]>("/uploads");
  } catch (error) {
    return rejectWithValue(toMessage(error, "No se pudieron cargar las subidas"));
  }
});

// GET /uploads/:id — detalle de una subida (con sus documentos e imágenes).
export const fetchUploadById = createAsyncThunk<
  UploadDetail,
  number,
  { rejectValue: string }
>("uploads/fetchUploadById", async (id, { rejectWithValue }) => {
  try {
    return await apiFetch<UploadDetail>(`/uploads/${id}`);
  } catch (error) {
    return rejectWithValue(toMessage(error, "No se pudo cargar la subida"));
  }
});
