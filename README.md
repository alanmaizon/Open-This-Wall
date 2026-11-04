# Field Notes

An interactive browser-based wiki teaching analytic geometry through physics. It is a static React + Vite + TypeScript build with SVG figures, React Three Fiber scenes, KaTeX-ready math styling, MiniSearch client-side search, and a central citation registry.

## Development

```bash
npm install
npm run dev
npm run build
```

## Adding an article

1. Add an `.mdx` file under `src/content/articles/` with YAML frontmatter (`slug`, `tier`, `title`, `summary`, and `topics`).
2. Add its metadata to the `articles` array in `src/main.tsx` and select a figure kind or add an article renderer.
3. Keep equations and factual claims paired with a `CitationMark` so readers can inspect the registry entry.

## Adding a figure

Reuse `Point`, `Vector`, and `Plane` from `src/geometry.ts`. Add a focused React component beside the existing figures; keep controls keyboard reachable with labels and native range inputs. Use SVG/D3 for 2D and `<Canvas>` from React Three Fiber for 3D.

## Adding a citation

Add a stable entry to `src/citations.json` with `id`, bibliographic fields, `tier`, `topic`, `explanation`, and (when available) `url`. Use that ID in an inline `CitationMark`.

The app has no server dependency and can be deployed from the generated `dist/` directory to any static host.
