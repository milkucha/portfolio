const items = [
  { href: "#intro", label: "Welcome" },
  { href: "#projects", label: "Projects" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-tertiary/10 bg-primary/85 backdrop-blur">
      <nav aria-label="Sections" className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <a href="#intro" className="text-sm font-semibold tracking-tight text-tertiary">
          milkucha
        </a>
        <ul className="flex gap-1 text-sm sm:gap-3">
          {items.map((i) => (
            <li key={i.href}>
              <a
                href={i.href}
                className="rounded px-2 py-1 text-secondary transition-colors hover:bg-tertiary hover:text-primary focus-visible:bg-tertiary focus-visible:text-primary focus-visible:outline-none"
              >
                {i.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
