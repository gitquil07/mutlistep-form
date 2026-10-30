import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { z } from "zod";
import { TOTAL_STEPS } from "../constants/steps";
import { stepOneSchema } from "../schemas/stepOne";
import { createStepTwoSchema } from "../schemas/stepTwo";
import { getAvailablePrograms } from "../constants/stepTwo";
import { toStepOneForm } from "./serializers";
import type { FormState, StepOneStored, StepTwoStored } from "./persistence";
import type { RootState } from "./index";

const initialState: FormState = {
  stepOne: null,
  stepTwo: null,
};

// Chosen countries as a comparable key: order and empty (not yet picked) rows don't matter
const countriesKey = (stepOne: StepOneStored | null) =>
  (stepOne?.countries ?? [])
    .filter((id): id is number => id != null)
    .sort((a, b) => a - b)
    .join(",");

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    saveStepOne(state, action: PayloadAction<StepOneStored>) {
      // Programs are chosen for specific destinations, so a different set of countries
      // starts the program choice over, even if the same programs are on offer
      if (countriesKey(state.stepOne) !== countriesKey(action.payload)) {
        state.stepTwo = null;
      }
      state.stepOne = action.payload;
    },
    saveStepTwo(state, action: PayloadAction<StepTwoStored>) {
      state.stepTwo = action.payload;
    },
  },
});

export const { saveStepOne, saveStepTwo } = formSlice.actions;
export default formSlice.reducer;

// A step is complete when its saved data (submitted or draft) passes its schema.
// Nothing else is stored, so this can never drift from the data itself.
const isValid = (schema: z.ZodType, values: unknown) =>
  values != null && schema.safeParse(values).success;

// Programs sold for every country chosen in step one
export const selectAvailablePrograms = createSelector(
  [(state: RootState) => state.form.stepOne?.countries],
  (countries) => getAvailablePrograms(countries ?? []),
);

export const selectStepCompletion = createSelector(
  [
    (state: RootState) => state.form.stepOne,
    (state: RootState) => state.form.stepTwo,
    selectAvailablePrograms,
  ],
  (stepOne, stepTwo, availablePrograms): boolean[] => [
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
