import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../shared/api/apiClient";
import type {
  HtmlDocument,
  HtmlDocumentDetail,
} from "../Interface/UploadsInterface";

// Extrae un mensaje legible del error del cliente HTTP (ver apiClient).
function toMessage(error: unknown, fallback: string): string {
  return (error as { message?: string })?.message ?? fallback;
}

// GET /html — listado resumido de documentos HTML (sin content ni images).
export const fetchHtmlDocuments = createAsyncThunk<
  HtmlDocument[],
  void,
  { rejectValue: string }
>("htmlDocuments/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await apiFetch<HtmlDocument[]>("/html");
  } catch (error) {
    return rejectWithValue(
      toMessage(error, "No se pudieron cargar los documentos"),
    );
  }
});

// GET /html/:id — detalle de un documento: content + imágenes asociadas.
export const fetchHtmlDocumentById = createAsyncThunk<
  HtmlDocumentDetail,
  number,
  { rejectValue: string }
>("htmlDocuments/fetchById", async (id, { rejectWithValue }) => {
  try {
    return await apiFetch<HtmlDocumentDetail>(`/html/${id}`);
  } catch (error) {
    return rejectWithValue(toMessage(error, "No se pudo cargar el documento"));
  }
});
