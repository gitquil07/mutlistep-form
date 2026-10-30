"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, setupPersistence } from "./index";
import { loadFormState } from "./persistence";

// Creates the store once per tab, restoring the saved draft. On the server there is no
// localStorage, so it starts empty; HydrationGate keeps that from ever reaching the screen.
const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [store] = useState(() =>
    makeStore(typeof window === "undefined" ? undefined : loadFormState()),
  );

  useEffect(() => setupPersistence(store), [store]);

  return <Provider store={store}>{children}</Provider>;
};

export default StoreProvider;
