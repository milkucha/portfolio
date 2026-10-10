import { projects, techs } from "@/data/projects";

const techLabel = new Map(techs.map((t) => [t.id, t.label]));

/** Semantic, visually hidden fallback of the graph for screen readers and crawlers. */
export function ProjectList() {
  return (
    <div className="sr-only">
      <h3>Project list</h3>
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <h4>{p.name}</h4>
            <p>{p.oneLiner}</p>
            <ul>
              {p.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <p>Status: {p.status}</p>
            <p>Stack: {p.stack.map((id) => techLabel.get(id) ?? id).join(", ")}</p>
            {p.links.length > 0 && (
              <p>
                {p.links.map((l) => (
                  <a key={l.href} href={l.href}>
                    {p.name} on {l.label}{" "}
                  </a>
                ))}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
