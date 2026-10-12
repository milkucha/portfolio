import type { Metadata, Viewport } from "next";
import { Caveat, DM_Mono, Inter, League_Spartan } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const caveat = Caveat({
  variable: "--font-caveat",
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
    <html lang="en" className={`${inter.variable} ${dmMono.variable} ${leagueSpartan.variable} ${caveat.variable} antialiased`}>
      <body className="min-h-svh bg-primary text-tertiary">{children}</body>
    </html>
  );
}
