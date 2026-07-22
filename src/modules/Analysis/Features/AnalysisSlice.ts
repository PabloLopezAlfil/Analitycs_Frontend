import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/Store";
import type { RequestStatus } from "../../shared/types/request";
import type {
  Analysis,
  AnalysisCheck,
  AnalysisDetail,
  CheckCategory,
} from "../Interface/AnalysisInterface";
import { fetchAnalyses, fetchAnalysisById, runAnalysis, reviewAnalysisWithAi } from "./AnalysisThunk";

interface AnalysisState {
  items: Analysis[]; // histórico/listado (GET /analysis)
  current: AnalysisDetail | null; // análisis abierto
  runStatus: RequestStatus; // análisis en curso 
  runIAStatus: RequestStatus; // revisión por IA en curso 
  listStatus: RequestStatus; // carga del listado
  detailStatus: RequestStatus; // carga del detalle
  error?: string;
}

const initialState: AnalysisState = {
  items: [],
  current: null,
  runStatus: "idle",
  runIAStatus: "idle",
  listStatus: "idle",
  detailStatus: "idle",
  error: undefined,
};

const analysisSlice = createSlice({
  name: "analysis",
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(runAnalysis.pending, (state) => {
        state.runStatus = "pending";
        state.error = undefined;
      })
      .addCase(runAnalysis.fulfilled, (state, action) => {
        state.runStatus = "fulfilled";
        state.current = action.payload;
        state.items.unshift(action.payload);
      })
      .addCase(runAnalysis.rejected, (state, action) => {
        state.runStatus = "rejected";
        state.error = action.payload ?? action.error.message;
      })
      .addCase(fetchAnalyses.pending, (state) => {
        state.listStatus = "pending";
        state.error = undefined;
      })
      .addCase(fetchAnalyses.fulfilled, (state, action) => {
        state.listStatus = "fulfilled";
        state.items = action.payload;
      })
      .addCase(fetchAnalyses.rejected, (state, action) => {
        state.listStatus = "rejected";
        state.error = action.payload ?? action.error.message;
      })
      .addCase(fetchAnalysisById.pending, (state) => {
        state.detailStatus = "pending";
        state.error = undefined;
      })
      .addCase(fetchAnalysisById.fulfilled, (state, action) => {
        state.detailStatus = "fulfilled";
        state.current = action.payload;
      })
      .addCase(fetchAnalysisById.rejected, (state, action) => {
        state.detailStatus = "rejected";
        state.error = action.payload ?? action.error.message;
      })
     
      .addCase(reviewAnalysisWithAi.pending, (state) => {
        state.runIAStatus = "pending";
        state.error = undefined;
      })
      .addCase(reviewAnalysisWithAi.fulfilled, (state, action) => {
        state.runIAStatus = "fulfilled";
        state.current = action.payload;
      })
      .addCase(reviewAnalysisWithAi.rejected, (state, action) => {
        state.runIAStatus = "rejected";
        state.error = action.payload ?? action.error.message;
      })

  },
});

export const { clearError } = analysisSlice.actions;


export const selectAnalyses = (state: RootState) => state.analysis.items;
export const selectCurrentAnalysis = (state: RootState) => state.analysis.current;
export const selectAnalysisRunStatus = (state: RootState) => state.analysis.runStatus;
export const selectAnalysisRunIAStatus = (state: RootState) => state.analysis.runIAStatus;
export const selectAnalysisListStatus = (state: RootState) => state.analysis.listStatus;
export const selectAnalysisDetailStatus = (state: RootState) => state.analysis.detailStatus;
export const selectAnalysisError = (state: RootState) => state.analysis.error;

// Selectores derivados sobre el análisis abierto (alimentan los componentes de
// resultados: tabla por categoría, cola de revisión y errores frecuentes).
export const selectChecksByCategory = (
  state: RootState,
): Record<CheckCategory, AnalysisCheck[]> => {
  const grouped = {
    STRUCTURE: [],
    IMAGES: [],
    TYPOGRAPHY: [],
    COLOR_CONTRAST: [],
    LINKS_BUTTONS: [],
    RESPONSIVE_CSS: [],
  } as Record<CheckCategory, AnalysisCheck[]>;
  for (const check of state.analysis.current?.checks ?? []) {
    grouped[check.category].push(check);
  }
  return grouped;
};

export const selectReviewQueue = (state: RootState): AnalysisCheck[] =>
  state.analysis.current?.checks.filter((c) => c.status === "REVISION_PENDIENTE") ?? [];

export const selectErrors = (state: RootState): AnalysisCheck[] =>
  state.analysis.current?.checks.filter((c) => c.status === "ERROR") ?? [];

export default analysisSlice.reducer;
