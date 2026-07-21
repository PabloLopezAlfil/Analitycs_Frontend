import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../modules/Login/Features/AuthSlice";
import uploadsReducer from "../modules/Uploads/Features/UploadsSlice";
import htmlDocumentsReducer from "../modules/Uploads/Features/HtmlDocumentsSlice";
import imagesReducer from "../modules/Uploads/Features/ImagesSlice";
import analysisReducer from "../modules/Analysis/Features/AnalysisSlice";

const Store = configureStore({
  reducer: {
    auth: authReducer,
    uploads: uploadsReducer,
    htmlDocuments: htmlDocumentsReducer,
    images: imagesReducer,
    analysis: analysisReducer,
  },
});

export type AppStore = typeof Store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export default Store;
