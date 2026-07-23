import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../shared/api/apiClient";
import type { Upload, UploadDetail } from "../Interface/UploadsInterface";

function toMessage(error: unknown, fallback: string): string {
  return (error as { message?: string })?.message ?? fallback;
}


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


export const deleteUpload = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("uploads/deleteUpload", async (id, { rejectWithValue }) => {
  try {
    await apiFetch<void>(`/uploads/${id}`, { method: "DELETE" });
    return id;
  } catch (error) {
    return rejectWithValue(toMessage(error, "No se pudo eliminar la subida"));
  }
});

