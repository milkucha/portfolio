import { categoryColors, categoryLabels, projectColor, projectsUsing, techs } from "@/data/projects";
import type { Project, Tech } from "@/data/types";

type CardNode =
  | { kind: "project"; project: Project }
  | { kind: "tech"; tech: Tech };

const techById = new Map(techs.map((t) => [t.id, t]));

export function GraphCard({
  node,
  pinned,
  onClose,
}: {
  node: CardNode | null;
  pinned: boolean;
  onClose: () => void;
}) {
  return (
    <div
      aria-live="polite"
      className="rounded-lg border border-tertiary/15 bg-primary/85 p-4 text-sm text-tertiary shadow-xl backdrop-blur"
    >
      {!node && (
        <p className="text-tertiary/60">
          <span className="hidden md:inline">Hover a node to explore, click to pin it, drag to rearrange.</span>
          <span className="md:hidden">Tap a node to explore, drag to rearrange.</span>
        </p>
      )}

      {node?.kind === "project" && <ProjectDetails project={node.project} />}
      {node?.kind === "tech" && <TechDetails tech={node.tech} />}

      {node && pinned && (
        <button
          type="button"
          onClick={onClose}
          className="mt-3 text-xs text-tertiary/60 underline-offset-2 hover:text-tertiary hover:underline"
        >
          Close
        </button>
      )}
    </div>
  );
}

function ProjectDetails({ project }: { project: Project }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-base font-semibold">
        <span className="inline-block size-2.5 rounded-full" style={{ background: projectColor }} />
        {project.name}
      </h3>
      <p className="mt-1 text-tertiary/85">{project.oneLiner}</p>
      <ul className="mt-3 list-disc space-y-1 pl-4 text-tertiary/75 marker:text-tertiary/40">
        {project.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {project.stack.map((id) => {
          const t = techById.get(id);
          if (!t) return null;
          return (
            <li
              key={id}
              className="rounded-full border px-2 py-0.5 text-xs"
              style={{ borderColor: categoryColors[t.category], color: categoryColors[t.category] }}
            >
              {t.label}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-tertiary/60">{project.status}</p>
      {project.links.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-x-3 text-xs">
          {project.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline-offset-2 hover:underline"
            >
              {l.label} ↗
            </a>
          ))}
        </p>
      )}
    </div>
  );
}

function TechDetails({ tech }: { tech: Tech }) {
  const used = projectsUsing(tech.id);
  return (
    <div>
      <h3 className="flex items-center gap-2 text-base font-semibold">
        <span className="inline-block size-2.5 rounded-full" style={{ background: categoryColors[tech.category] }} />
        {tech.label}
      </h3>
      <p className="mt-0.5 text-xs text-tertiary/60">
        {categoryLabels[tech.category]}
        {tech.note ? ` · ${tech.note}` : ""}
      </p>
      <p className="mt-3 text-tertiary/75">Used in:</p>
      <ul className="mt-1 space-y-0.5">
        {used.map((p) => (
          <li key={p.id} className="text-tertiary/90">
            {p.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
