import { configureStore } from "@reduxjs/toolkit";
import formReducer from "./formSlice";
import { saveFormState, type FormState } from "./persistence";

const SAVE_DELAY_MS = 300;

// One store per browser tab, created by StoreProvider. Nothing here touches the browser
// at import time, so the module is safe to load during server rendering.
export const makeStore = (savedForm?: FormState) =>
  configureStore({
    reducer: {
      form: formReducer,
    },
    preloadedState: savedForm ? { form: savedForm } : undefined,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// Write the form slice to localStorage shortly after it changes (drafts update on every
// keystroke), and immediately when the page is hidden or closed so nothing is lost.
// Returns a cleanup that removes the listeners.
export const setupPersistence = (store: AppStore): (() => void) => {
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
  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") flush();
  };

  const unsubscribe = store.subscribe(() => {
    if (store.getState().form === lastSaved) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, SAVE_DELAY_MS);
  });
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", onVisibilityChange);

  return () => {
    flush();
    unsubscribe();
    window.removeEventListener("pagehide", flush);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
};
