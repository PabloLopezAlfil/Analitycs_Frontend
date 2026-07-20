import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./Store";

// crudos para tener el tipado de RootState y AppDispatch.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
