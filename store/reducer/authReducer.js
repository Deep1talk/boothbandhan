import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
};

export const authReducer = createSlice({
  name: "authStore",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload ?? null;
      state.isAuthenticated = Boolean(action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = authReducer.actions;

export default authReducer.reducer;
