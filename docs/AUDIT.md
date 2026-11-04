# Repository audit

Date: 2026-11-04

## Scope and current baseline

This audit covers the full `src/` tree, `README.md`, `package.json`, the GitHub
Actions workflow, both article files, and `src/citations.json`. The current
production build succeeds with `npm ci && npm run build`. There is no lint or
test script in `package.json`. The repository is a small React/Vite/TypeScript
application with two article files and one application entry point.

## Planned feature status

| Feature | Status | Evidence |
| --- | --- | --- |
| Prerequisite maps per tier | Partial | `src/main.tsx` displays a static three-node map, but it is not data-driven and has no article prerequisites or completion state. |
| Three tiers | Partial | `Foundations`, `Intermediate`, and `Advanced` are represented in the type, filters, map, and citation metadata. Only two Foundations articles are backed by files; Intermediate and Advanced entries in `main.tsx` are placeholders. |
| Exercises with hidden solutions | Present, incomplete | Both rendered articles contain native `<details>` solutions. There is no completion state, exercise metadata, or dedicated accessible reveal label beyond the summary text. |
| “Where this shows up” sections | Present | `ArticleView` renders a callout for both article variants. |
| Glossary with notation conventions | Partial | A static notation card exists in the right rail. It is not a glossary page and is not linked from articles. |
| Global searchable/filterable references page | Partial | A references drawer lists all four citation records and has an input and tier buttons, but neither control is wired to state; there is no topic filter or standalone page. |
| Progress tracking | Missing | No progress state, `localStorage` use, completion controls, or reset control exists. |
| Code companions | Missing | No code-companion content or code examples are registered. |
| Self-check quizzes | Missing | No quiz model, questions, answers, or scoring UI exists. |

## Geometry and figures

Geometry types are shared rather than duplicated. `Point`, `Vector`, and
`Plane` are defined in `src/geometry.ts`, with reusable operations such as
`add`, `magnitude`, and `normalize`. The 2D frame and velocity figures import
and use these types. The 3D orbit scene currently computes its geometry inline
and does not use the shared types, but it does not define duplicate geometry
types.

The frame figure has a pointer-drag interaction and a range input; the
velocity figure has a range input; and the orbit scene renders a static
React Three Fiber canvas. The drag target has `tabIndex={0}` but no keyboard
interaction or accessible name, so it is not keyboard-equivalent to the
pointer interaction.

## Citations and factual claims

`src/citations.json` contains four entries, and all four currently include a
non-empty `explanation`. The records are:

- `goldstein` — used by the velocity article.
- `strang` — used by the coordinate-systems article.
- `siciliano` — used by the coordinate-systems article.
- `battin` — currently unused.

Citation marks are implemented as accessible buttons by `CitationMark` in
`src/main.tsx`, and the drawer displays each selected citation's explanation.
However, citation coverage is not complete: many factual paragraphs,
derivations, displayed equations, exercise solutions, figure labels, and
“Where this shows up” claims have no `CitationMark`. The citation mark number
is also hard-coded to three cases and is not derived from the registry.

The current citation drawer opens a source URL when one is present. All four
records have URLs, but external URL reachability could not be verified from
this environment because outbound requests returned HTTP `000`. No URL is
syntactically missing in the current registry.

## Math rendering

KaTeX is installed as the `katex` dependency and is used by `MathLine` via
`katex.renderToString`. The stylesheet also imports KaTeX CSS from a jsDelivr
URL. The production build completes, so the rendering code type-checks and
bundles successfully. The current article text also contains several
plain-text equations that are not passed through `MathLine`.

## Article registration

Articles are registered in two places:

1. The files under `src/content/articles/` contain frontmatter for:
   `coordinate-systems` and `velocity-as-a-vector`.
2. The `articles` array in `src/main.tsx` repeats those records and adds
   `lines-and-planes` and `orbits`, for which no article files exist.

The app does not load or parse MDX files at runtime/build time; the rendered
article body and metadata are hard-coded in `ArticleView`. Frontmatter is
therefore not the source of truth today. The planned fix should load article
metadata from the article folder automatically and remove the duplicate
registration, while preserving the existing article content.

## Links, alternative text, and keyboard access

- `index.html` has `lang="en"` and a descriptive document title.
- The brand link uses `href="#"`, which is a placeholder navigation link and
  changes the URL rather than representing a real home route.
- Citation links use `target="_blank"` with `rel="noreferrer"` and are
  structurally valid, but their external reachability was not testable here.
- The two main SVG figures have `role="img"` and `aria-label` descriptions.
  The orbit canvas has no equivalent accessible description.
- There are no raster images requiring `alt` text.
- Native buttons, inputs, range controls, and `<details>/<summary>` provide
  keyboard access for most controls.
- The draggable SVG circle is focusable but has no keyboard handler or
  accessible name, so its interaction is not keyboard accessible.
- The references search input has no label or `aria-label`; the close buttons
  have no accessible name; and the references filter buttons do not expose
  selected state.
- The drawer backdrop closes on click but has no focus management, focus trap,
  Escape-key handling, or dialog semantics.
- The “soon” tier buttons filter the current list rather than opening a
  corresponding article, which can leave the selected article and visible
  tier inconsistent.

## CI and repository metadata

The only workflow, `.github/workflows/deploy-pages.yml`, installs dependencies,
runs `npm run build`, uploads `dist`, and deploys GitHub Pages. It does not run
lint, tests, citation validation, frontmatter validation, or a separate
typecheck command beyond the typecheck bundled into the build. `package.json`
is named `analytic-geometry-wiki`, while the README heading and document title
use “Field Notes”; naming is inconsistent.

## Recommended implementation order after review

1. Resolve the project name and license choice with the maintainer.
2. Make frontmatter the single article metadata source and remove phantom
   article registrations.
3. Add contributor guidance, README status/roadmap, and validation scripts.
4. Implement the requested features one branch and pull request at a time,
   starting with progress tracking.
