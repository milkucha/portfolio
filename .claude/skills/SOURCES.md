# Vendored design skills

Third-party agent skills, copied verbatim (markdown only) at pinned commits so they are
versioned with this repo. Every file was read in full before it was added. None of them run
code, add hooks, phone home, or change settings. Each skill folder carries its upstream
license file.

To update one, re-fetch at a new SHA, read the diff in full, and update this table.

| Skill folder | Source | Commit | License | Included | Excluded / notes |
| --- | --- | --- | --- | --- | --- |
| `frontend-design/` | https://github.com/anthropics/skills/tree/dbd4588f9e1033efb41dad4bef2f7947c8993d44/skills/frontend-design | `dbd4588f9e1033efb41dad4bef2f7947c8993d44` | Apache-2.0 (`LICENSE.txt` in the skill folder; the repo itself has no top-level license) | `SKILL.md`, `LICENSE.txt` | Rest of the repo (other skills) not taken |
| `animate/` | https://github.com/emilkowalski/skills/tree/e8a175de22ae1e49370fc144c1f3bb9aeedf988d/skills/animate | `e8a175de22ae1e49370fc144c1f3bb9aeedf988d` | MIT | `SKILL.md`, `RECIPES.md` | Has a canned "Initial Response" greeting (kept as-is) |
| `review-animations/` | https://github.com/emilkowalski/skills/tree/e8a175de22ae1e49370fc144c1f3bb9aeedf988d/skills/review-animations | same | MIT | `SKILL.md`, `STANDARDS.md` | Canned greeting; `disable-model-invocation: true` (invoke it by name) |
| `improve-animations/` | https://github.com/emilkowalski/skills/tree/e8a175de22ae1e49370fc144c1f3bb9aeedf988d/skills/improve-animations | same | MIT | `SKILL.md`, `AUDIT.md`, `PLAN-TEMPLATE.md` | Canned greeting. Its workflow writes plans to `plans/` and has an `execute` variant that dispatches a subagent in a worktree; that's agent workflow, not code it runs |
| `emil-design-eng/` | https://github.com/emilkowalski/skills/tree/e8a175de22ae1e49370fc144c1f3bb9aeedf988d/skills/emil-design-eng | same | MIT | `SKILL.md`, plus the repo-root `performance-cheatsheet.md` | Canned greeting. The cheatsheet isn't linked from any skill; it's kept here as a reference |
| `find-animation-opportunities/` | https://github.com/emilkowalski/skills/tree/e8a175de22ae1e49370fc144c1f3bb9aeedf988d/skills/find-animation-opportunities | same | MIT | `SKILL.md` | Canned greeting. Added because `animate` cross-references it |
| `animation-vocabulary/` | https://github.com/emilkowalski/skills/tree/e8a175de22ae1e49370fc144c1f3bb9aeedf988d/skills/animation-vocabulary | same | MIT | `SKILL.md` | Canned greeting |
| `minimalist-ui/` | https://github.com/Leonxlnx/taste-skill/tree/717446e07a78d4e6d7918b1fde1a263378eebac9/skills/minimalist-skill | `717446e07a78d4e6d7918b1fde1a263378eebac9` | MIT | `SKILL.md` (folder renamed to match its `name: minimalist-ui`) | It stands alone, so the main `taste-skill` wasn't needed. Repo `scripts/`, `skill.sh`, plugin manifests, and images not taken |
| `motion-design/` | https://github.com/LottieFiles/motion-design-skill/tree/f9a8a041b85185ee4881b3471d3415e939aac772/skills/motion-design | `f9a8a041b85185ee4881b3471d3415e939aac772` | MIT | Whole `skills/motion-design/` tree (SKILL.md, `director/`, `patterns/`, `reference/`) | None |
| `fixing-motion-performance/` | https://github.com/ibelick/ui-skills/tree/61db8907496d7687d2ae44c59ddb912d4702af96/skills/fixing-motion-performance | `61db8907496d7687d2ae44c59ddb912d4702af96` | MIT | `SKILL.md` | None |

## Read but not installed

- **ibelick `baseline-ui`** (same SHA, MIT). It requires adding packages: "MUST use `motion/react`",
  "`tw-animate-css`", and "`cn` (`clsx` + `tailwind-merge`)". That clashes with this project's
  no-new-dependencies rule. Install it yourself if you want it:
  https://github.com/ibelick/ui-skills/tree/61db8907496d7687d2ae44c59ddb912d4702af96/skills/baseline-ui
- **Other emilkowalski skills** (`animate-expo`, `apple-design`, `ask-sonner`, `break-ui`,
  `mobile-native`, `pick-ui-library`, `prototype`, `write-swift`): not about web motion for this
  site, so not fetched.

## Licence check

Every vendored skill is under MIT or Apache-2.0. Both allow redistribution as long as the
licence text is kept, so a copy sits in each folder. No skill was left out for licence reasons.
