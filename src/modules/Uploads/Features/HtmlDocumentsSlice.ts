import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/Store";
import type { RequestStatus } from "../../shared/types/request";
import type {
  HtmlDocument,
  HtmlDocumentDetail,
} from "../Interface/UploadsInterface";
import {
  fetchHtmlDocumentById,
  fetchHtmlDocuments,
} from "./HtmlDocumentsThunk";

interface HtmlDocumentsState {
  items: HtmlDocument[]; // listado (GET /html)
  current: HtmlDocumentDetail | null; // detalle con content + imágenes (GET /html/:id)
  listStatus: RequestStatus;
  detailStatus: RequestStatus;
  error?: string;
}

const initialState: HtmlDocumentsState = {
  items: [],
  current: null,
  listStatus: "idle",
  detailStatus: "idle",
  error: undefined,
};

const htmlDocumentsSlice = createSlice({
  name: "htmlDocuments",
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Listado
      .addCase(fetchHtmlDocuments.pending, (state) => {
        state.listStatus = "pending";
        state.error = undefined;
      })
      .addCase(fetchHtmlDocuments.fulfilled, (state, action) => {
        state.listStatus = "fulfilled";
        state.items = action.payload;
      })
      .addCase(fetchHtmlDocuments.rejected, (state, action) => {
        state.listStatus = "rejected";
        state.error = action.payload ?? action.error.message;
      })
      // Detalle
      .addCase(fetchHtmlDocumentById.pending, (state) => {
        state.detailStatus = "pending";
        state.error = undefined;
      })
      .addCase(fetchHtmlDocumentById.fulfilled, (state, action) => {
        state.detailStatus = "fulfilled";
        state.current = action.payload;
      })
      .addCase(fetchHtmlDocumentById.rejected, (state, action) => {
        state.detailStatus = "rejected";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const { clearError } = htmlDocumentsSlice.actions;

export const selectHtmlDocuments = (state: RootState) =>
  state.htmlDocuments.items;
export const selectCurrentHtmlDocument = (state: RootState) =>
  state.htmlDocuments.current;
export const selectHtmlDocumentsListStatus = (state: RootState) =>
  state.htmlDocuments.listStatus;

// Quita la extensión .html/.htm del nombre del documento para mostrarlo.
function stripHtmlExtension(name: string): string {
  return name.replace(/\.html?$/i, "");
}

// Mapa htmlId → name (sin la extensión .html), para resolver el nombre del
// documento analizado en las vistas de análisis (que solo conocen el htmlId).
export const selectHtmlDocumentNames = (
  state: RootState,
): Record<number, string> => {
  const names: Record<number, string> = {};
  for (const doc of state.htmlDocuments.items) {
    names[doc.id] = stripHtmlExtension(doc.name);
  }
  return names;
};
export const selectHtmlDocumentsError = (state: RootState) =>
  state.htmlDocuments.error;

export default htmlDocumentsSlice.reducer;
