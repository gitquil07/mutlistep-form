import { configureStore } from "@reduxjs/toolkit";
import formReducer from "./formSlice";
import { loadFormState, saveFormState } from "./persistence";

const SAVE_DELAY_MS = 300;

const savedForm = loadFormState();

export const store = configureStore({
  reducer: {
    form: formReducer,
  },
  preloadedState: savedForm ? { form: savedForm } : undefined,
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// Write the form slice to localStorage shortly after it changes (drafts update on every
// keystroke), and immediately when the page is hidden or closed so nothing is lost.
let lastSaved = store.getState().form;
let saveTimer: ReturnType<typeof setTimeout> | undefined;

const flush = () => {
  clearTimeout(saveTimer);
  const { form } = store.getState();
  if (form !== lastSaved) {
    lastSaved = form;
    saveFormState(form);
  }
};

store.subscribe(() => {
  if (store.getState().form === lastSaved) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, SAVE_DELAY_MS);
});

window.addEventListener("pagehide", flush);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") flush();
});
