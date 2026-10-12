# COPY: every piece of text on the cube page (branch `proto/cube-bio`, port 3001)

Edit anything below and hand the file back. Keep the structure (headings, `-` bullets, `key:` names) so
I can map each line to its place in the code. Source file for each block is noted in italics.
Tip: add `DELETE` or `ADD` notes in plain words if you want a line removed or a new one added.

---

## 1. Right pane: BIO

*src/components/lab/introText.ts, src/data/site.ts*

- name (big title, wraps to two lines): Camilo Álvarez
- paragraph 1: Full-stack engineer building in Python, TypeScript and Java. Hybrid workflows with agentic tools.
- paragraph 2: Based in Berlin. Maintainer of a Minecraft mod with 550K+ downloads.
- paragraph 3: Drawn to complex systems and behaviours.
- paragraph 4: Shipping open source as milkucha.
  - the word `milkucha` is set in italic

## 2. Menu (under the cube)

*src/components/lab/SkillsCube.tsx*

- BIO
- PROJECTS (opens the six domain buttons, in this order, left to right):
  1. Backend
  2. Frontend
  3. Applied AI
  4. Modding
  5. Game Dev
  6. Design
- CONTACT

## 3. Face hints (small text on each cube face, one item per line)

*src/components/lab/cubeFaces.ts*

- Backend: Python · Django · PostgreSQL · Docker
- Frontend: TypeScript · React · Next.js · Tailwind CSS
- Applied AI: Python · Ollama · LLM agents
- Modding: Java · Gradle · Minecraft
- Game Dev: Godot · GDScript · Aseprite
- Design: Figma · Blender · MagicaVoxel

## 4. Project cards (right pane, PROJECTS)

*src/components/lab/cubeProjects.ts*. Each card has: name, one-liner, highlights (at most 2; weaker
projects get none), tech chips (untitled), a footnote, link icons, and an optional thumbnail (none set yet).
The footnote reads "Built with Claude Code" or "Built with Claude Code and OpenCode" (workflow tools joined
with ", " and " and "); it is omitted when there are none. Cards are listed per domain.

### Backend

#### Oceana Core
- one-liner: Production backend for a multi-region vacation-rental operator.
- highlights:
  - Settlement engine for taxes, fees, commissions and multi-currency revenue-share splits
  - Reservation ingestion from a property-management system's REST API
- tech chips: Python, TypeScript, Django, PostgreSQL, Docker, REST APIs
- footnote: Built with Claude Code and OpenCode
- links: Website (https://www.oceanasuites.com)

### Frontend

#### Portfolio
- one-liner: CSS 3D cube driven by quaternions. No 3D library.
- highlights: (none)
- tech chips: TypeScript, React, Next.js, Tailwind CSS
- footnote: Built with Claude Code
- links: GitHub (https://github.com/milkucha/portfolio)

### Applied AI

#### Provenance
- one-liner: World-building tool: AI agents write the language, plain code owns the world state.
- highlights:
  - Simulated output and testing suite
  - Model-agnostic and token-lean
- tech chips: Python, Ollama
- footnote: Built with Claude Code and OpenCode
- links: GitHub (https://github.com/milkucha/provenance)

### Modding

#### The Roads More Travelled
- one-liner: Dynamic terrain mod for Minecraft: often-travelled routes erode into worn paths.
- highlights:
  - 550K+ downloads across Modrinth and CurseForge; 86 GitHub stars
  - Maintained across 4 Minecraft versions and 3 mod loaders (Fabric, Forge, NeoForge)
- tech chips: Java, Gradle, Minecraft, Fabric, Forge, NeoForge, GitHub Actions
- footnote: Built with Claude Code
- links: GitHub (https://github.com/milkucha/trmt), Modrinth (https://modrinth.com/mod/the-roads-more-travelled), CurseForge (https://www.curseforge.com/minecraft/mc-mods/the-roads-more-travelled), YouTube (https://www.youtube.com/watch?v=OvsNVaFiK1Y)

### Game dev

#### Icarus
- one-liner: Arcade game about flying without hubris: fly as far as you can before you fall into the sea.
- highlights: (none)
- tech chips: Godot, GDScript, Aseprite
- footnote: (none)
- links: itch.io (https://milkucha.itch.io/icarus)

#### Kucha
- one-liner: 2D pixel art arena brawler: two players plus AI bots, four weapons, destructible terrain. Multiplayer in progress.
- highlights: (none)
- tech chips: Godot, GDScript, Aseprite
- footnote: (none)
- links: (none)

### Design

#### Arranca Cover
- one-liner: Voxel art isometric city. Hand authored model, Minecraft to Blender pipeline.
- highlights: (none)
- tech chips: Blender, MagicaVoxel, Python
- footnote: (none)
- links: (none)

Card labels that are fixed in the code (tell me if you want them changed): the heading on each card is the
domain name (Backend, Frontend, ...); chips have no group title; link buttons show
only icons, the labels above are their tooltips.

## 5. Contact (right pane, CONTACT)

*src/data/site.ts, src/components/lab/SkillsCube.tsx*

- heading: Contact
- text rows:
  - GitHub: github.com/milkucha (https://github.com/milkucha)
  - Email: milkucha@disroot.org (mailto:milkucha@disroot.org)
  - Location: Berlin (plain text, no link)
- icon row, label `Elsewhere`, icons in this order:
  1. LinkedIn (https://www.linkedin.com/in/camilo-alvarez-595292156/)
  2. itch.io (https://milkucha.itch.io), profile URL assumed from the Icarus link, please confirm
  3. YouTube (https://www.youtube.com/@milkuchachuklim), the channel

## 6. Page metadata (browser tab and search)

*src/app/layout.tsx*

- title: Camilo Álvarez — Portfolio
- description: Portfolio of Camilo Álvarez, software developer: projects, skills and contact.

## 7. Lab-only controls (below the menu, will be removed before launch)

- `faces:` color / ghost / wire

## 8. Open items

- CV link missing (no file or URL exists yet; not added to Contact).
- Thumbnails for The Roads More Travelled and Arranca Cover missing (cards support an optional `image`).
- Oceana "Production" wording is the owner's own earlier claim.
