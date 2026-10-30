import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stepOne: null,
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    saveStepOne(state, action) {
      state.stepOne = action.payload;
    },
  },
});

export const { saveStepOne } = formSlice.actions;
export default formSlice.reducer;
