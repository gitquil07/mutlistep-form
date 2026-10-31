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
      {/* antd styles go into `@layer antd`. Our CSS is unlayered, so it always wins over
          antd's defaults no matter which stylesheet the browser loads last (antd's style
          tags are injected after the app CSS here, which silently undid our icon colours) */}
      <AntdRegistry layer>
        <Providers>{children}</Providers>
      </AntdRegistry>
    </body>
  </html>
);

export default RootLayout;
