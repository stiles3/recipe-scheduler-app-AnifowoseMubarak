import { combineReducers } from "@reduxjs/toolkit";
import appSlice from "./app/appSlice";
import { appApi } from "./app";

export const rootReducer = combineReducers({
  [appApi.reducerPath]: appApi.reducer,
  app: appSlice,
});
