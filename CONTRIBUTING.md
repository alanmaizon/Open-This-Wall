# Contributing to Field Notes

## Adding an article

1. Add an `.mdx` file under `src/content/articles/`.
2. Include frontmatter with `slug`, `tier`, `title`, `summary`, and `topics`.
3. Keep the article's factual claims and equations precise and unchanged unless
   the pull request explicitly documents a correction.
4. Add or update the associated figure and renderer using the existing
   conventions when the article needs an interactive visualization.

## Adding a figure

Reuse `Point`, `Vector`, and `Plane` from `src/geometry.ts` rather than
introducing duplicate geometry types. Keep all controls client-side, keyboard
accessible, and visibly labeled. SVG/D3 is used for 2D figures and React Three
Fiber is used for 3D figures.

## Adding a citation

Add a stable entry to `src/citations.json` with an `id`, bibliographic fields,
`tier`, `topic`, and a clear `explanation`. Include a URL when available.
Every new factual claim or equation must have a citation mark that points to a
registry entry, and every new registry entry must explain what it supports.

## Pull requests

Each pull request should:

- explain what changed and why;
- include the relevant validation commands and results;
- describe screenshots or other UI changes, when applicable;
- list open questions or decisions instead of silently guessing;
- list every article-content or reference correction;
- list every new dependency and its purpose;
- include a citation for every new factual claim.

Before submitting, run:

```bash
npm ci
npm run build
```
