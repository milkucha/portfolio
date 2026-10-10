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
    <main className="min-h-svh overflow-x-clip bg-[#f7ece1] pt-6 pb-16 text-[#020202]">
      <p className="mb-6 px-4 text-center text-xs tracking-wide">lab / cube prototype</p>
      <SkillsCube />
    </main>
  );
}
