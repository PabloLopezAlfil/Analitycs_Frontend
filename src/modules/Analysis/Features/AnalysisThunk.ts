import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../shared/api/apiClient";
import type { Analysis, AnalysisDetail } from "../Interface/AnalysisInterface";

// Extrae un mensaje legible del error del cliente HTTP (ver apiClient).
function toMessage(error: unknown, fallback: string): string {
  return (error as { message?: string })?.message ?? fallback;
}


export const runAnalysis = createAsyncThunk<
  AnalysisDetail,
  number,
  { rejectValue: string }
>("analysis/run", async (htmlId, { rejectWithValue }) => {
  try {
    return await apiFetch<AnalysisDetail>("/analysis", {
      method: "POST",
      body: JSON.stringify({ htmlId }),
    });
  } catch (error) {
    return rejectWithValue(toMessage(error, "No se pudo ejecutar el análisis"));
  }
});


export const fetchAnalyses = createAsyncThunk<
  Analysis[],
  number | void,
  { rejectValue: string }
>("analysis/fetchAll", async (htmlId, { rejectWithValue }) => {
  try {
    const query = typeof htmlId === "number" ? `?html_id=${htmlId}` : "";
    return await apiFetch<Analysis[]>(`/analysis${query}`);
  } catch (error) {
    return rejectWithValue(toMessage(error, "No se pudieron cargar los análisis"));
  }
});

export const fetchAnalysisById = createAsyncThunk<
  AnalysisDetail,
  number,
  { rejectValue: string }
>("analysis/fetchById", async (id, { rejectWithValue }) => {
  try {
    return await apiFetch<AnalysisDetail>(`/analysis/${id}`);
  } catch (error) {
    return rejectWithValue(toMessage(error, "No se pudo cargar el análisis"));
  }
});

export const reviewAnalysisWithAi = createAsyncThunk<
  AnalysisDetail,
  number,
  { rejectValue: string }
>("analysis/reviewWithAi", async (id, { rejectWithValue }) => {
  try {
    return await apiFetch<AnalysisDetail>(`/analysis/${id}/ai`, {
      method: "POST",
    });
  } catch (error) {
    return rejectWithValue(toMessage(error, "No se pudo revisar el análisis con IA"));
  }
});
