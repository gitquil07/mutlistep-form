import { createSelector, createSlice } from "@reduxjs/toolkit";
import { TOTAL_STEPS } from "../constants/steps";
import { stepOneSchema } from "../schemas/stepOne";
import { createStepTwoSchema } from "../schemas/stepTwo";
import { getAvailablePrograms } from "../constants/stepTwo";
import { toStepOneForm } from "./serializers";

const initialState = {
  stepOne: null,
  stepTwo: null,
};

// Chosen countries as a comparable key: order and empty (not yet picked) rows don't matter
const countriesKey = (stepOne) =>
  (stepOne?.countries ?? [])
    .filter((id) => id != null)
    .sort((a, b) => a - b)
    .join(",");

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    saveStepOne(state, action) {
      // Programs are chosen for specific destinations, so a different set of countries
      // starts the program choice over, even if the same programs are on offer
      if (countriesKey(state.stepOne) !== countriesKey(action.payload)) {
        state.stepTwo = null;
      }
      state.stepOne = action.payload;
    },
    saveStepTwo(state, action) {
      state.stepTwo = action.payload;
    },
  },
});

export const { saveStepOne, saveStepTwo } = formSlice.actions;
export default formSlice.reducer;

// A step is complete when its saved data (submitted or draft) passes its schema.
// Nothing else is stored, so this can never drift from the data itself.
const isValid = (schema, values) =>
  values != null && schema.safeParse(values).success;

// Programs sold for every country chosen in step one
export const selectAvailablePrograms = createSelector(
  [(state) => state.form.stepOne?.countries],
  (countries) => getAvailablePrograms(countries ?? []),
);

export const selectStepCompletion = createSelector(
  [
    (state) => state.form.stepOne,
    (state) => state.form.stepTwo,
    selectAvailablePrograms,
  ],
  (stepOne, stepTwo, availablePrograms) => [
    stepOne != null && isValid(stepOneSchema, toStepOneForm(stepOne)),
    // A program picked earlier stops counting once the countries no longer allow it
    isValid(
      createStepTwoSchema(availablePrograms.map((program) => program.id)),
      stepTwo,
    ),
  ],
);

// Furthest step the user may open: every step before it must be complete
export const selectFurthestReachableStep = createSelector(
  [selectStepCompletion],
  (completion) => {
    const firstIncomplete = completion.indexOf(false);
    return firstIncomplete === -1 ? TOTAL_STEPS : firstIncomplete + 1;
  },
);
