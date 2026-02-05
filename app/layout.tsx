import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sharing AR",
  description: "View .usdz models in Apple AR Quick Look",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://unpkg.com/@google/model-viewer@3.4.0/dist/model-viewer.min.js"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
