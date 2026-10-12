# LOG: cube lab sessions, 2026-10-11 and 2026-10-12

Where we left off. Everything is local: nothing pushed, `main` untouched, no Vercel previews exist.
This file lives on `proto/cube-bio`.

## Versions (one git worktree per branch)

| Port | Folder | Branch | What it is |
|---|---|---|---|
| 3000 | `~/portfolio` | `proto/cube-sections` | Three sections on one page: bio, cube carousel, contact. Base for the others. |
| 3001 | `~/portfolio-bio` | `proto/cube-bio` | **Current favourite.** Cube page, bio in the right pane, BIO / PROJECTS / CONTACT menu, tumble spin. |
| 3003 | `~/portfolio-spin-tumble` | `proto/cube-spin-tumble` | Sections page + tumble spin (continuous, drifting diagonal axis). Black right-aligned nav, typed name loop (name <-> milkucha). |
| 3005 | `~/portfolio-spin-loop` | `proto/cube-spin-loop` | Sections page + smooth closed loop through the six face poses, slows at each face. One fixed focus pose per face. |
| 3006 | `~/portfolio-spin-flow` | `proto/cube-spin-flow` | Same loop but constant speed, no slow-down (20 deg/s, ~31 s lap). |
| none | `~/portfolio-spin-cycle`, `~/portfolio-spin-steps` | `proto/cube-spin-cycle`, `proto/cube-spin-steps` | Not used. Servers stopped; branches and folders still exist (delete when decided). |

Spin versions: you liked 3003 (tumble), 3005 (loop rhythm) and then asked for 3006 (loop, but continuous). Not yet decided
which one wins, or whether 3001 keeps the tumble (it has it now).

## Restart the servers

`node_modules` in each extra worktree is a hard-linked copy (`cp -al ~/portfolio/node_modules <worktree>/node_modules`);
Turbopack rejects symlinks. In each folder:

```bash
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"
npm run dev -- -p <port>      # then open http://localhost:<port>/lab/cube
```

Servers were left running on 3000, 3001, 3003, 3005, 3006. Stop one by its own PID (`ss -ltnp | grep :<port>`), not a broad pkill.

## State of 3001 (`proto/cube-bio`)

- Right pane shows one of three at a time (600 ms crossfade): bio (name 72 px League Spartan 400 + DM Mono text), project card, contact card.
- Menu under the cube: BIO / PROJECTS / CONTACT, left-aligned. PROJECTS is a button; the six domain buttons unroll to its right (staggered), uppercase, single line. Domain hover = lift 6 px (no tilt).
- Project cards: link icons only (no frame; colour change to rose `#b56576` on hover, var `--link-hover`); TECH chips with title, WORKFLOW chips (Claude Code, OpenCode on Oceana, Provenance, TRMT).
- Face hints on the cube (one item per line, mono, top-left): Backend Python/Django/PostgreSQL/Docker; Frontend TypeScript/React/Next.js/Tailwind CSS; Applied AI Python/Ollama/LLM agents; Game dev Godot/GDScript/Aseprite; Modding Java/Gradle/Minecraft; Design Figma/Blender/MagicaVoxel.
- Spin: tumble (`TUMBLE_*` constants). Label corner is chosen per pass by looking ahead; the button goes to a fixed upright pose.
- Typed-name animation and the black nav are **not** on 3001 (they are on 3003/3005/3006, which have the sections page).
- LinkedIn replaced the TRMT link in contact (`src/data/site.ts`).

## Open items / decisions to make

1. **Oceana link vs repo rule.** The Oceana card now links to `https://www.oceanasuites.com` (globe icon). CLAUDE.md says Oceana is client work: no client names or specifics. Either keep the link and update that rule in CLAUDE.md, or remove the link.
2. **TRMT YouTube** links to the channel (`@milkuchachuklim`), not a video. Give a URL if there is a specific one.
3. **Chips still to settle:** Oceana's frontend (prototype planned within ~2 weeks); when it exists, add TypeScript to its chips. "Full-stack" in the intro depends on that being real.
4. **Pick the spin** (tumble / loop / flow) and port the winner to the chosen base page. Loop/flow note: a face is within 12 deg of its pose for only ~1.2 s at 20 deg/s; use `FLOW_DEG_PER_S` (14 gives 1.7 s) or `FLOW_EASE` if the text feels brief.
5. **Pick the page structure** (sections page vs cube-as-main with the menu) and merge: the typed name, nav and PROJECTS menu live on different branches.
6. Unviewed: the agents and I could not see any of this in a browser; check phone widths, the three-state crossfade, BIO's immediate spin resume mid-snap, and resume-after-drag on the loop/flow curves.
7. Intro copy is final for now: "Full-stack software engineer building in Python, JS and Java. Hybrid workflows with agentic tools. Drawn to complex systems and behaviours." (`introText.ts` in the sections-based branches; `INTRO_LINES` elsewhere). The "Drawn to" typo fix is on every branch.
8. Cut-over order (CLAUDE.md) still applies before anything reaches `main`: add domain in Vercel, repoint DNS, disable GitHub Pages, then merge.

## Update 2026-10-12 (state of 3001, `proto/cube-bio`)

3001 is now the main version. Done since the notes above:

- Spin: tumble stays (list order and spin order cannot match; accepted). Label fix ported: the snap target's label is pinned upright at snap start.
- PROJECTS shows the focused card at once and the card follows the tumble (crossfade). BIO/CONTACT resume the spin immediately. Clicking PROJECTS again returns to the bio.
- Cube interaction removed: no drag/fling/click, no hover reaction. Arrow keys and keyboard focus remain.
- Faces: list order Backend, Frontend, Applied AI, Modding, Game dev, Design. Colours: purple, light blue `#7fb2d6`, black, rose, yellow `#f4e285`, cream. Black/cream opposite (Applied AI right, Design left).
- Domain buttons: selected one underlined (underline lives on the inner span).
- Bio: "Full-stack engineer building in Python, TypeScript and Java. Hybrid workflows with agentic tools." / "Drawn to complex systems and behaviours." / "Shipping open source as *milkucha*." (DM Mono italic). Column 26rem, name wraps to two lines.
- Contact: rows roll down (staggered); GitHub and Email as text; "Elsewhere" icon row in the order LinkedIn, itch.io, YouTube. The itch.io URL (`https://milkucha.itch.io`) is assumed from the Icarus link.
- TRMT YouTube link is the video (`watch?v=OvsNVaFiK1Y`); Oceana chips include TypeScript.
- `COPY.md` lists every text on the page for editing; hand it back to apply.

Not done / open:

- The TRMT video link and the Oceana TypeScript chip are only on 3001. The other branches (`cube-sections`, `cube-spin-tumble`, `cube-spin-loop`, `cube-spin-flow`) still have the old project-card content (no workflow chips, no icon links, JavaScript in the Oceana chips), so the edit did not apply there. Port 3001's `cubeProjects.ts` and `linkIcons.tsx` if those branches stay alive.
- "This site" card still says "drag with inertia, spring-snapping to a face"; dragging is gone.
- Unviewed in a browser: everything above (agents cannot see it). Check phone widths, the contact roll-down, the icon row, the italic handle, the PROJECTS crossfade.
- Item 8 above (cut-over order before `main`) still applies.

## 2026-10-12 later: copy and card pass (`proto/cube-bio`)

- Bio is now four paragraphs (added "Based in Berlin. Maintainer of a Minecraft mod with 550K+ downloads.").
- Project cards rewritten to short noun-phrase copy; max 2 highlights per card (rule in the `PanelEntry` doc comment), weaker projects have none. Figma chip removed from Arranca Cover.
- Card design: Tech and Workflow group titles removed; workflow is now a dimmed mono footnote ("Built with Claude Code and OpenCode"), omitted when empty; highlights render only when present; optional `image` thumbnail support (none set).
- Contact: added a plain-text "Location: Berlin" row after Email (`ContactLink.href` is now optional; main page handles it). No CV link (nothing to link to yet).
- `COPY.md` updated to match, with an Open items list. Not viewed in a browser; tsc and eslint clean, /lab/cube returns 200.
2026-10-12 later: bio rewritten by owner to four lines, no job title line, 'JS' instead of 'TypeScript'
2026-10-12 later: bio set to five short lines (role/location, stack, workflow, handle, mod); body 15px, 13px on phones; mobile menu gap closed
2026-10-12 later: bio cut to four lines (role/location, stack with agentic tools, handle, mod); 'hybrid workflows' line removed

## 2026-10-12 later: TRMT card backdrop (`proto/cube-bio`)

- The Roads More Travelled card has a tilted, edge-faded picture in its upper right, behind the text (decorative: `alt=""`, `aria-hidden`, no pointer events, no layout effect). Data: optional `PanelEntry.backdrop` in `cubeProjects.ts` (only TRMT sets it); markup in `SkillsCube.tsx`; CSS under `.lab-cube-backdrop` in `cube.css` (rotate 8deg, slight rotateY, soft rectangular mask, opacity 0.6; smaller on phones). It fades in with the card entrance.
- Image: Modrinth gallery "Grass and Dirt Erosion" (https://cdn.modrinth.com/data/74oZhrEe/images/909db198a9e2bafdfe4bac42354d21e463243ef6.png), resized to 1000px WebP at `public/lab/trmt.webp` (about 45 KB).
- Viewed in headless Chromium at 1440 and 390 wide.

2026-10-12 later: TRMT backdrop moved from the card to the page's upper-right corner, larger, shown only with the Modding card
- Rendered as a decorative `<img alt="" aria-hidden>` at the top of the layout wrapper in `SkillsCube.tsx` (source: the shown card's `PanelEntry.backdrop`); `<main>` is now `relative isolate` so it positions against the page corner. Opacity follows panel state (open), 600ms fade, none under reduced motion. CSS in `cube.css`: width clamp(30rem, 54vw, 58rem), top -2rem, right -3rem, rotateY(-10deg) rotate(8deg), mask softened toward the text, opacity 0.55 (0.5 and 15rem wide on phones). The old card-anchored rule and `:has()` CSS are gone.
- Portfolio card one-liner shortened to "CSS 3D cube driven by quaternions."
2026-10-12 later: Provenance highlights rewritten (multiple-pass simulation on 50+ characters, measurement scripts, model-agnostic); highlight limit relaxed to 3 for strong projects

2026-10-12 later: Applied AI/Provenance card has a page-corner backdrop (README image); backdrops preloaded and fade with the card
- Image: the only picture in the remote README (https://i.imgur.com/cASXA69.png, 805x791 logo on dark graph art), edge border cropped, 1000px WebP at `public/lab/provenance.webp` (about 45 KB).
- All backdrops are now mounted at once (`BACKDROPS` in `SkillsCube.tsx`) and only opacity changes, so each is loaded before use and fades with its card, including Modding to Applied AI. Optional per-picture tuning (`aspect`, `width`, `opacity`) in `PanelEntry.backdrop`, passed as CSS variables.
- Provenance one-liner restored to the owner's wording.
- Owner rule: no semicolons and no em-dashes in visible copy. TRMT one-liner restored to the owner wording and its first highlight uses a comma. The page <title> in layout.tsx is untouched (awaiting an owner decision).

2026-10-12 later: backdrop pictures removed (owner: too busy); preserved on branch proto/cube-bio-pictures (fc70b3b); page title now 'Camilo Álvarez, Full-stack Developer'
2026-10-12 later: project card titles now link (GitHub link if present, else the sole link, else plain text); icon row unchanged
2026-10-12 later: title links have no underline; rose on hover is the only cue
2026-10-12 later: TRMT chips removed as a test; old list in a comment in cubeProjects.ts
2026-10-12 later: cube face label larger: name 0.085 -> 0.102 of --size (+20%), hint 0.052 -> 0.068 (+30%); fits at all sizes
2026-10-12 later: TRMT chips restored (chips are the readable stack while the cube spins); ghost fill 82% -> 92% opaque
2026-10-12 later: chips sweep: Oceana drops REST APIs; Provenance adds LLM agents; TRMT drops loaders and GitHub Actions (not used by the owner); Git deliberately not a chip
