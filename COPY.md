# COPY: every piece of text on the cube page (branch `proto/cube-bio`, port 3001)

Edit anything below and hand the file back. Keep the structure (headings, `-` bullets, `key:` names) so
I can map each line to its place in the code. Source file for each block is noted in italics.
Tip: add `DELETE` or `ADD` notes in plain words if you want a line removed or a new one added.

---

## 1. Right pane: BIO

*src/components/lab/introText.ts, src/data/site.ts*

- name (big title, wraps to two lines): Camilo Álvarez
- paragraph 1: Full-stack engineer building in Python, TypeScript and Java. Hybrid workflows with agentic tools.
- paragraph 2: Drawn to complex systems and behaviours.
- paragraph 3: Shipping open source as milkucha.
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

*src/components/lab/cubeProjects.ts*. Each card has: name, one-liner, highlights, TECH chips,
WORKFLOW chips, link icons. Cards are listed per domain.

### Backend

#### Oceana Core
- one-liner: A back-office platform for a multi-region vacation-rental operator.
- highlights:
  - Settlement engine for taxes, fees, commissions and multi-currency revenue-share splits
  - Reservation ingestion from a property-management system's REST API
  - Relational data model on PostgreSQL
- tech chips: Python, TypeScript, Django, PostgreSQL, Docker, REST APIs
- workflow chips: Claude Code, OpenCode
- links: Website (https://www.oceanasuites.com)

### Frontend

#### Portfolio
- one-liner: This site:
  - CSS 3D driven by quaternions.
- tech chips: TypeScript, React, Next.js, Tailwind CSS
- workflow chips: Claude Code
- links: GitHub (https://github.com/milkucha/portfolio)

### Applied AI

#### Provenance
- one-liner: World-building tool that grows a fictional society from an authored seed that drifts based on typed knowledge.
- highlights:
  - Deterministic logic handles world state transformations, bounded agents supply language layer.
  - Simulated output and testing suite.
  - Model-agnostic and token-lean.
- tech chips: Python, Ollama
- workflow chips: Claude Code, OpenCode
- links: GitHub (https://github.com/milkucha/provenance)

### Modding

#### The Roads More Travelled
- one-liner: Dynamic terrain mod for Minecraft that erodes often-travelled routes turning them into realistic, yet vanilla-friendly worn paths.
- highlights:
  - Erosion data stored using sparse map, most parameters configurable via JSON
  - Maintained across 4 Minecraft versions and 3 mod loaders (Fabric, Forge and NeoForge)
  - 550K+ downloads across Modrinth and CurseForge; 86 GitHub stars
- tech chips: Java, Gradle, Minecraft, Fabric, Forge, NeoForge, GitHub Actions
- workflow chips: Claude Code
- links: GitHub (https://github.com/milkucha/trmt), Modrinth (https://modrinth.com/mod/the-roads-more-travelled), CurseForge (https://www.curseforge.com/minecraft/mc-mods/the-roads-more-travelled), YouTube (https://www.youtube.com/watch?v=OvsNVaFiK1Y)

### Game dev

#### Icarus
- one-liner: Arcade game about flying without hubris: fly as far as you can before you fall into the sea.
- highlights:
  - Sidescrolling, parallax and high-score system
  - Hand crafted pixel art
- tech chips: Godot, GDScript, Aseprite
- workflow chips: (none)
- links: itch.io (https://milkucha.itch.io/icarus)

#### Kucha
- one-liner: 2D pixel art arena brawler: two players plus AI bots, four weapons, destructible terrain.
- highlights:
  - Multiple arenas and weapons
  - AI bots
  - Destructive terrain
  - Multiplayer support (in progress)
- tech chips: Godot, GDScript, Aseprite
- workflow chips: (none)
- links: (none)

### Design

#### Arranca Cover
- one-liner: Voxel art isometric city
- highlights:
  - Hand authored model
  - Minecraft to Blender pipeline
- tech chips: Figma, Blender, MagicaVoxel, Python
- workflow chips: (none)
- links: (none)

Card labels that are fixed in the code (tell me if you want them changed): the heading on each card is the
domain name (Backend, Frontend, ...); the chip group titles are `Tech` and `Workflow`; link buttons show
only icons, the labels above are their tooltips.

## 5. Contact (right pane, CONTACT)

*src/data/site.ts, src/components/lab/SkillsCube.tsx*

- heading: Contact
- text rows:
  - GitHub: github.com/milkucha (https://github.com/milkucha)
  - Email: milkucha@disroot.org (mailto:milkucha@disroot.org)
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
