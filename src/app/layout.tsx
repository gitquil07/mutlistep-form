import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Покупка страхового полиса",
  icons: { icon: "/favicon.svg" },
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="ru">
    <body>
      <AntdRegistry>
        <Providers>{children}</Providers>
      </AntdRegistry>
    </body>
  </html>
);

export default RootLayout;
