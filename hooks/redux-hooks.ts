import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, RootState, store } from "../redux/store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore: () => typeof store = useStore;
