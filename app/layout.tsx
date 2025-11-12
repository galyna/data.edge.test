import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Data Edge - Sports Data Analytics",
    template: "%s | Data Edge",
  },
  description: "Multi-source sports data aggregation and analytics platform for live betting markets",
  keywords: ["sports data", "betting analytics", "odds comparison", "live scores", "data aggregation"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

