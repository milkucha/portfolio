import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { SkillsCube } from "@/components/lab/SkillsCube";

export const metadata: Metadata = {
  title: "Cube (lab)",
  description: "Prototype: skills cube intro element.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f7ece1",
  colorScheme: "light",
  viewportFit: "cover",
};

export default function CubeLabPage() {
  return (
    <main className="lab-cube-page min-h-svh overflow-x-clip bg-[#f7ece1] pt-6 pb-16 text-[#020202]">
      <SkillsCube />
      <footer
        className="lab-cube-footer mt-10 px-6 text-center text-[0.6875rem] opacity-60"
        style={{ fontFamily: 'var(--font-dm-mono), ui-monospace, "SF Mono", Menlo, Consolas, monospace' }}
      >
        <Link href="/impressum" className="hover:underline">
          Impressum
        </Link>
        {" · "}
        <Link href="/datenschutz" className="hover:underline">
          Datenschutz
        </Link>
      </footer>
    </main>
  );
}
