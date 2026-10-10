import { Contact } from "@/components/Contact";
import { IntroGlow } from "@/components/IntroGlow";
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
          <IntroGlow />
          <div className="mx-auto w-full max-w-3xl px-4 py-20">
            <h1 id="intro-title" className="text-4xl font-semibold tracking-tight text-quaternary sm:text-6xl">
              {site.name}
            </h1>
            <p className="mt-3 text-sm text-quaternary sm:text-base">{site.tagline}</p>
            <div className="mt-8 space-y-4 text-base leading-relaxed text-quaternary sm:text-lg">
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

        <Contact />
      </main>
    </>
  );
}
