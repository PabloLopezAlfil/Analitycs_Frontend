import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/Store";
import type { RequestStatus } from "../../shared/types/request";
import type { Upload, UploadDetail } from "../Interface/UploadsInterface";
import { fetchUploadById, fetchUploads, uploadFile } from "./UploadsThunk";

interface UploadsState {
  items: Upload[]; // listado (GET /uploads)
  current: UploadDetail | null; // detalle abierto (GET /uploads/:id)
  listStatus: RequestStatus;
  detailStatus: RequestStatus;
  uploadStatus: RequestStatus; // subida en curso (POST /uploads)
  error?: string;
}

const initialState: UploadsState = {
  items: [],
  current: null,
  listStatus: "idle",
  detailStatus: "idle",
  uploadStatus: "idle",
  error: undefined,
};

const uploadsSlice = createSlice({
  name: "uploads",
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Listado
      .addCase(fetchUploads.pending, (state) => {
        state.listStatus = "pending";
        state.error = undefined;
      })
      .addCase(fetchUploads.fulfilled, (state, action) => {
        state.listStatus = "fulfilled";
        state.items = action.payload;
      })
      .addCase(fetchUploads.rejected, (state, action) => {
        state.listStatus = "rejected";
        state.error = action.payload ?? action.error.message;
      })
      // Detalle
      .addCase(fetchUploadById.pending, (state) => {
        state.detailStatus = "pending";
        state.error = undefined;
      })
      .addCase(fetchUploadById.fulfilled, (state, action) => {
        state.detailStatus = "fulfilled";
        state.current = action.payload;
      })
      .addCase(fetchUploadById.rejected, (state, action) => {
        state.detailStatus = "rejected";
        state.error = action.payload ?? action.error.message;
      })
      // Subida: al completar, deja el detalle creado como current y lo añade
      // al principio del listado para que aparezca sin recargar.
      .addCase(uploadFile.pending, (state) => {
        state.uploadStatus = "pending";
        state.error = undefined;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.uploadStatus = "fulfilled";
        state.current = action.payload;
        state.items.unshift(action.payload);
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.uploadStatus = "rejected";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const { clearError } = uploadsSlice.actions;

export const selectUploads = (state: RootState) => state.uploads.items;
export const selectCurrentUpload = (state: RootState) => state.uploads.current;
export const selectUploadStatus = (state: RootState) =>
  state.uploads.uploadStatus;
export const selectUploadsListStatus = (state: RootState) =>
  state.uploads.listStatus;
export const selectUploadsDetailStatus = (state: RootState) =>
  state.uploads.detailStatus;
export const selectUploadsError = (state: RootState) => state.uploads.error;

export default uploadsSlice.reducer;
