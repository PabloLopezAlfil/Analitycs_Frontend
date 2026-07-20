import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../shared/api/apiClient";
import type { Image } from "../Interface/UploadsInterface";

// Extrae un mensaje legible del error del cliente HTTP (ver apiClient).
function toMessage(error: unknown, fallback: string): string {
  return (error as { message?: string })?.message ?? fallback;
}

// GET /images?html_id=:id — imágenes asociadas a un documento HTML.
export const fetchImages = createAsyncThunk<
  Image[],
  number,
  { rejectValue: string }
>("images/fetchAll", async (htmlId, { rejectWithValue }) => {
  try {
    return await apiFetch<Image[]>(`/images?html_id=${htmlId}`);
  } catch (error) {
    return rejectWithValue(
      toMessage(error, "No se pudieron cargar las imágenes"),
    );
  }
});

// GET /images/:id — detalle de una imagen concreta.
export const fetchImageById = createAsyncThunk<
  Image,
  number,
  { rejectValue: string }
>("images/fetchById", async (id, { rejectWithValue }) => {
  try {
    return await apiFetch<Image>(`/images/${id}`);
  } catch (error) {
    return rejectWithValue(toMessage(error, "No se pudo cargar la imagen"));
  }
});
