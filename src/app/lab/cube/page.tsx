import type { Metadata, Viewport } from "next";
import { SkillsCube } from "@/components/lab/SkillsCube";
import { INTRO_LINES } from "@/components/lab/introText";
import { site } from "@/data/site";
import "@/components/lab/labPage.css";

export const metadata: Metadata = {
  title: "Cube (lab)",
  description: "Prototype: bio, skills cube as a projects carousel, and contact.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f7ece1",
  colorScheme: "light",
};

export default function CubeLabPage() {
  return (
    <main className="lab-page min-h-svh overflow-x-clip">
      <nav aria-label="Sections" className="lab-page-nav">
        <a href="#bio">Bio</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </nav>

      <section id="bio" aria-labelledby="bio-title" className="lab-page-section">
        <div className="lab-page-inner">
          <h1 id="bio-title" className="lab-page-name">
            {site.name}
          </h1>
          {INTRO_LINES.map((line) => (
            <p key={line} className="lab-page-bio">
              {line}
            </p>
          ))}
        </div>
      </section>

      <section id="projects" aria-label="Projects" className="lab-page-section">
        <SkillsCube />
      </section>

      <section id="contact" aria-labelledby="contact-title" className="lab-page-section">
        <div className="lab-page-inner">
          <h2 id="contact-title" className="lab-page-heading">
            Contact
          </h2>
          <ul className="lab-page-links">
            {site.contact.map((c) => (
              <li key={c.href}>
                <span className="lab-page-linkLabel">{c.label}</span>
                <a
                  href={c.href}
                  {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {c.display}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
