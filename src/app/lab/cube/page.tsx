import type { Metadata, Viewport } from "next";
import { SkillsCube } from "@/components/lab/SkillsCube";

export const metadata: Metadata = {
  title: "Cube (lab)",
  description: "Prototype: skills cube intro element.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f7ece1",
  colorScheme: "light",
};

export default function CubeLabPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 overflow-x-clip bg-[#f7ece1] py-12 text-[#020202]">
      <p className="px-4 text-center text-xs tracking-wide">lab / cube prototype</p>
      <SkillsCube />
    </main>
  );
}
