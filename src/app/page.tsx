import { Nav } from "@/components/Nav";
import { ProjectGraph } from "@/components/ProjectGraph";
import { ProjectList } from "@/components/ProjectList";
import { site } from "@/data/site";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <section
          id="intro"
          aria-labelledby="intro-title"
          className="intro-glow flex min-h-[calc(100svh-3.5rem)] scroll-mt-14 items-center"
        >
          <div className="mx-auto w-full max-w-3xl px-4 py-20">
            <h1 id="intro-title" className="text-4xl font-semibold tracking-tight sm:text-6xl">
              {site.name}
            </h1>
            <p className="mt-3 text-sm text-secondary sm:text-base">{site.tagline}</p>
            <div className="mt-8 space-y-4 text-base leading-relaxed text-tertiary/85 sm:text-lg">
              {site.bio.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>
          </div>
        </section>

        <section
          id="projects"
          aria-labelledby="projects-title"
          className="flex min-h-[calc(100svh-3.5rem)] scroll-mt-14 flex-col border-t border-tertiary/10"
        >
          <div className="mx-auto w-full max-w-6xl px-4 pt-8">
            <h2 id="projects-title" className="text-2xl font-semibold tracking-tight">
              Projects
            </h2>
            <p className="mt-1 text-sm text-tertiary/60">
              What I build, and the stack each project runs on.
            </p>
          </div>
          <div className="relative mx-auto flex w-full max-w-6xl flex-1 pb-6">
            <ProjectGraph />
          </div>
          <ProjectList />
        </section>

        <section
          id="contact"
          aria-labelledby="contact-title"
          className="flex min-h-[calc(100svh-3.5rem)] scroll-mt-14 items-center border-t border-tertiary/10"
        >
          <div className="mx-auto w-full max-w-3xl px-4 py-20">
            <h2 id="contact-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Contact
            </h2>
            <ul className="mt-8 space-y-4">
              {site.contact.map((c) => (
                <li key={c.href} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
                  <span className="w-40 shrink-0 text-sm text-tertiary/60">{c.label}</span>
                  <a
                    href={c.href}
                    {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="break-all text-lg text-secondary underline-offset-4 hover:underline"
                  >
                    {c.display}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
