import { createSlice } from "@reduxjs/toolkit";

export interface AppState {
  deviceId: null | string;
  reload: boolean;
}

const initialState: AppState = {
  deviceId: null,
  reload: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setDeviceId: (state, action) => {
      state.deviceId = action.payload;
    },
    setReload: (state) => {
      state.reload = !state.reload;
    },
  },
});

export const { setDeviceId, setReload } = appSlice.actions;
export default appSlice.reducer;
