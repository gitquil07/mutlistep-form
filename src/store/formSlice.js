import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stepOne: null,
  stepTwo: null,
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    saveStepOne(state, action) {
      state.stepOne = action.payload;
    },
    saveStepTwo(state, action) {
      state.stepTwo = action.payload;
    },
  },
});

export const { saveStepOne, saveStepTwo } = formSlice.actions;
export default formSlice.reducer;
