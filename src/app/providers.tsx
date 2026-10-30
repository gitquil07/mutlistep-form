"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { App as AntApp, ConfigProvider, type ThemeConfig } from "antd";
import ruRU from "antd/locale/ru_RU";
import "../lib/dayjs";
import StoreProvider from "../store/StoreProvider";

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#00c35f",
    colorLink: "#1b2b7a",
    colorText: "#2b2d33",
    colorTextPlaceholder: "#a3a8b5",
    colorFillTertiary: "#eef0f4",
    colorFillSecondary: "#e6e8ee",
    borderRadius: 8,
    fontFamily: 'Inter, system-ui, "Segoe UI", Roboto, sans-serif',
  },
  components: {
    Button: {
      primaryShadow: "none",
      fontWeight: 600,
    },
  },
};

const subscribeNoop = () => () => {};

// The form is built from the draft saved in this browser, which the server can't see.
// Rendering nothing until the client has mounted keeps server and client HTML identical
// (no hydration mismatch) and lets the forms read their saved values on first render.
const HydrationGate = ({ children }: { children: ReactNode }) => {
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  return isClient ? children : null;
};

const Providers = ({ children }: { children: ReactNode }) => (
  <StoreProvider>
    <ConfigProvider locale={ruRU} theme={theme}>
      <AntApp>
        <HydrationGate>{children}</HydrationGate>
      </AntApp>
    </ConfigProvider>
  </StoreProvider>
);

export default Providers;
