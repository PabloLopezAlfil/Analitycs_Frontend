import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../modules/Login/Features/AuthSlice";

const Store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export type AppStore = typeof Store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export default Store;
