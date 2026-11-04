# Repository audit

Date: 2026-11-04

## Completed

| Area | Status | Implementation |
| --- | --- | --- |
| Article registry | Complete | `src/content/registry.ts` eagerly loads MDX frontmatter and body, validates tier/kind, and filters unpublished entries. |
| Article discovery | Complete | Desktop and mobile navigation, search, tier filters, breadcrumbs, progress counts, and the right rail consume the published registry. |
| Mobile navigation | Complete | The mobile header exposes a keyboard-accessible drawer containing every published article grouped by tier. Selection closes the drawer without a reload. |
| Progress | Complete | Article and exercise completion persist in `localStorage`; reset is available from the progress rail. |
| References | Complete | Citation marks open a source drawer; references support text, tier, topic filtering, and BibTeX export. |
| Coordinate figure | Complete | The geometric point remains fixed while coordinates are calculated as `Rᵀr` in the rotated orthonormal basis. Pointer listeners are removed on pointer-up and keyboard arrows move the point. |
| Content validation | Complete | `npm run validate:content` checks required metadata, tiers, publication flags, and citation IDs. |

## Partial or known limitations

- MDX is currently loaded as raw text. The registry owns the article body and metadata, while the two existing interactive article layouts remain typed React renderers selected by `kind`; arbitrary MDX JSX is not yet compiled.
- Only two articles are published. Intermediate and Advanced are represented as learning tiers but have no published content yet, so their navigation sections are intentionally empty.
- Dialogs close by backdrop, close button, and (for the mobile article drawer) Escape. Citation, references, and glossary drawers do not yet restore focus to the trigger or provide a full focus trap.

## Accessibility and responsive review

The mobile layout was checked at 320px and 390px, and the 768px breakpoint remains covered by the responsive grid rules. The drawer has a labelled dialog, visible close control, selected article state, keyboard focus, Escape handling, and background scroll locking. SVGs have accessible names and the point has a keyboard equivalent.

Remaining accessibility debt includes focus restoration for non-mobile drawers, more explicit live announcements when an article changes, and a more complete keyboard interaction model for drag gestures.

## Technical debt and next milestones

1. Compile arbitrary MDX into reusable article components so article prose, equations, citations, and figures can be authored in one content format rather than selecting a `kind` renderer.
2. Add focus restoration and focus trapping to every modal drawer.
3. Publish the planned Intermediate and Advanced articles.
