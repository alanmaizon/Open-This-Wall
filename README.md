# Field Notes

An interactive browser-based wiki teaching analytic geometry through physics. It is a static React + Vite + TypeScript build with SVG figures, React Three Fiber scenes, KaTeX-ready math styling, MiniSearch client-side search, and a central citation registry.

## Development

```bash
npm install
npm run dev
npm run build
```

## Deploying to GitHub Pages

The `main` branch is deployed automatically by `.github/workflows/deploy-pages.yml`.
In the repository settings, set **Pages → Build and deployment → Source** to
**GitHub Actions**. The site will be available at:

`https://alanmaizon.github.io/Open-This-Wall/`

## Article status

| Article | Tier | Status |
| --- | --- | --- |
| Coordinate systems | Foundations | Drafted |
| Vectors as velocity | Foundations | Drafted |
| Lines & planes | Intermediate | Planned |
| Orbital state vectors | Advanced | Planned |

## Roadmap

- Compile MDX into reusable article components so prose, equations, citations, and figures share one content format.
- Publish Intermediate and Advanced modules, including a lazy-loaded orbital scene.
- Add accessible exercises with hidden solutions and self-check quizzes.
- Add focus restoration and full focus trapping to all modal drawers.
- Add a glossary with shared notation conventions.
- Add code companions and prerequisite maps backed by article metadata.
- Add CI checks for citation IDs, citation explanations, and required frontmatter.
- Run typecheck, lint, content validation, coordinate tests, and build checks before deployment.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the article, figure, citation, and pull request requirements.

## Adding an article

1. Add an `.mdx` file under `src/content/articles/` with YAML frontmatter (`slug`, `tier`, `title`, `summary`, and `topics`).
2. The article metadata will be loaded from its frontmatter; do not duplicate it in application code.
3. Keep equations and factual claims paired with a `CitationMark` so readers can inspect the registry entry.

## Adding a figure

Reuse `Point`, `Vector`, and `Plane` from `src/geometry.ts`. Add a focused React component beside the existing figures; keep controls keyboard reachable with labels and native range inputs. Use SVG/D3 for 2D and `<Canvas>` from React Three Fiber for 3D.

## Adding a citation

Add a stable entry to `src/citations.json` with `id`, bibliographic fields, `tier`, `topic`, `explanation`, and (when available) `url`. Use that ID in an inline `CitationMark`.

The app has no server dependency and can be deployed from the generated `dist/` directory to any static host.
