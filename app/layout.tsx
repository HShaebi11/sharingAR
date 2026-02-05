import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
