import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/Store";
import type { RequestStatus } from "../../shared/types/request";
import type { Image } from "../Interface/UploadsInterface";
import { fetchImageById, fetchImages } from "./ImagesThunk";

interface ImagesState {
  items: Image[]; // imágenes de un documento (GET /images?html_id=)
  current: Image | null; // imagen concreta (GET /images/:id)
  status: RequestStatus;
  error?: string;
}

const initialState: ImagesState = {
  items: [],
  current: null,
  status: "idle",
  error: undefined,
};

const imagesSlice = createSlice({
  name: "images",
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Listado por documento
      .addCase(fetchImages.pending, (state) => {
        state.status = "pending";
        state.error = undefined;
      })
      .addCase(fetchImages.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.items = action.payload;
      })
      .addCase(fetchImages.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload ?? action.error.message;
      })
      // Imagen concreta
      .addCase(fetchImageById.pending, (state) => {
        state.status = "pending";
        state.error = undefined;
      })
      .addCase(fetchImageById.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.current = action.payload;
      })
      .addCase(fetchImageById.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const { clearError } = imagesSlice.actions;

export const selectImages = (state: RootState) => state.images.items;
export const selectCurrentImage = (state: RootState) => state.images.current;
export const selectImagesStatus = (state: RootState) => state.images.status;
export const selectImagesError = (state: RootState) => state.images.error;

export default imagesSlice.reducer;
