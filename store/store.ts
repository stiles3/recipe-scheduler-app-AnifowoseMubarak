import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./root-reducer";
import { useDispatch as useReduxDispatch } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";

import { appApi } from "./app";
// Determine if the development tools should be enabled
const devtool = true; // (import.meta.env.VITE_ENV === "DEV") === true;

// Define the middleware array, including the RTK Query middleware
const middleware = (getDefaultMiddleware: any) =>
  getDefaultMiddleware().concat(appApi.middleware);

export const store = configureStore({
  reducer: rootReducer,
  devTools: devtool,
  middleware,
});

// Custom hook to use the Redux dispatch function
export const useDispatch = () => useReduxDispatch();

// Setup listeners for refetching data based on focus/internet reconnect
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
