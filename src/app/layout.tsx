import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Camilo Álvarez — Portfolio",
  description: "Portfolio of Camilo Álvarez, software developer: projects, skills and contact.",
};

export const viewport: Viewport = {
  themeColor: "#020202",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-svh bg-primary text-tertiary">{children}</body>
    </html>
  );
}
