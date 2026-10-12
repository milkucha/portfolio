import Link from "next/link";
import type { ReactNode } from "react";

const MONO = 'var(--font-dm-mono), ui-monospace, "SF Mono", Menlo, Consolas, monospace';

export function LegalShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main
      className="min-h-svh overflow-x-clip bg-[#f7ece1] px-6 pt-6 pb-16 text-[#020202]"
      style={{ fontFamily: MONO }}
    >
      <div className="mx-auto max-w-[38rem] text-[0.875rem] leading-[1.65]">
        <Link href="/lab/cube" className="text-[0.75rem] underline underline-offset-2 hover:opacity-70">
          Back
        </Link>
        <h1
          className="mt-8 mb-4 text-[2rem] leading-none font-normal tracking-[-0.02em]"
          style={{ fontFamily: "var(--font-league-spartan), var(--font-sans)" }}
        >
          {title}
        </h1>
        <p className="mb-8 text-[0.75rem] opacity-70">
          Draft. Have it reviewed before launch.
        </p>
        <div className="space-y-6 [&_h2]:mb-1 [&_h2]:text-[0.875rem] [&_h2]:font-medium [&_p]:break-words">
          {children}
        </div>
      </div>
    </main>
  );
}
