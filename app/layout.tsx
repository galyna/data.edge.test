import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Data Edge - Sports Data Analytics",
    template: "%s | Data Edge",
  },
  description:
    "Multi-source sports data aggregation and analytics platform for live betting markets",
  keywords: [
    "sports data",
    "betting analytics",
    "odds comparison",
    "live scores",
    "data aggregation",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon-32x32.png",
  },
  // Performance and SEO optimizations
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Data Edge",
    title: "Data Edge - Sports Data Analytics",
    description: "Multi-source sports data aggregation and analytics platform for live betting markets",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://logos-world.net" />
        <link rel="preconnect" href="https://media.api-sports.io" />
        <link rel="preconnect" href="https://ui-avatars.com" />
        <link rel="dns-prefetch" href="https://logos-world.net" />
        <link rel="dns-prefetch" href="https://media.api-sports.io" />
        <link rel="dns-prefetch" href="https://ui-avatars.com" />
        
        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/workers/dataAggregator.worker.js"
          as="script"
          crossOrigin="anonymous"
        />
        
        {/* Resource hints for performance */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
