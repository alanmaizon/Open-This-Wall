import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { scaleLinear } from 'd3';
import katex from 'katex';
import MiniSearch from 'minisearch';
import citations from './citations.json';
import { add, magnitude, Point, Vector } from './geometry';
import './styles.css';

type Tier = 'Foundations' | 'Intermediate' | 'Advanced';
type Article = { slug: string; tier: Tier; title: string; summary: string; topics: string[]; kind: 'coordinates' | 'velocity' };
type Citation = {
  id: string;
  author: string;
  title: string;
  publisher: string;
  year: number;
  tier: string;
  topic: string;
  explanation: string;
  doi?: string;
  isbn?: string;
  pages?: string;
  url?: string;
};
type Progress = { articles: string[]; exercises: string[] };

const emptyProgress: Progress = { articles: [], exercises: [] };
const progressKey = 'field-notes-progress';

function readProgress(): Progress {
  try {
    const stored = window.localStorage.getItem(progressKey);
    if (!stored) return emptyProgress;
    const parsed = JSON.parse(stored) as Partial<Progress>;
    return {
      articles: Array.isArray(parsed.articles) ? parsed.articles.filter((item): item is string => typeof item === 'string') : [],
      exercises: Array.isArray(parsed.exercises) ? parsed.exercises.filter((item): item is string => typeof item === 'string') : [],
    };
  } catch {
    return emptyProgress;
  }
}

function writeProgress(progress: Progress) {
  try {
    window.localStorage.setItem(progressKey, JSON.stringify(progress));
  } catch {
    // Progress is optional; the article remains usable when storage is unavailable.
  }
}

function bibtexValue(value: string) {
  return value.replace(/[{}]/g, '').replace(/\\/g, '\\\\');
}

function citationBibtex(citation: Citation) {
  const fields = [
    `  author = {${bibtexValue(citation.author)}}`,
    `  title = {${bibtexValue(citation.title)}}`,
    `  year = {${citation.year}}`,
    citation.publisher && `  publisher = {${bibtexValue(citation.publisher)}}`,
    citation.doi && `  doi = {${bibtexValue(citation.doi)}}`,
    citation.isbn && `  isbn = {${bibtexValue(citation.isbn)}}`,
    citation.pages && `  pages = {${bibtexValue(citation.pages)}}`,
    citation.url && `  url = {${bibtexValue(citation.url)}}`,
  ].filter(Boolean);
  return `@misc{${citation.id},\n${fields.join(',\n')}\n}`;
}

function downloadBibtex() {
  const content = citations.map(citationBibtex).join('\n\n');
  const url = URL.createObjectURL(new Blob([`${content}\n`], { type: 'application/x-bibtex' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'field-notes-references.bib';
  link.click();
  URL.revokeObjectURL(url);
}

const articles: Article[] = [
  { slug: 'coordinate-systems', tier: 'Foundations', title: 'Coordinate systems', summary: 'Choose a frame, state its origin, and make every geometric claim auditable.', topics: ['frames', 'coordinates', 'transformations'], kind: 'coordinates' },
  { slug: 'velocity-as-a-vector', tier: 'Foundations', title: 'Vectors as velocity', summary: 'Read velocity as a geometric rate of change, not merely a signed speed.', topics: ['vectors', 'kinematics', 'derivatives'], kind: 'velocity' },
  { slug: 'lines-and-planes', tier: 'Intermediate', title: 'Lines & planes', summary: 'Turn constraints into parametric and implicit geometry.', topics: ['constraints', 'geometry'], kind: 'coordinates' },
  { slug: 'orbits', tier: 'Advanced', title: 'Orbital state vectors', summary: 'Use position and velocity to expose the shape of an orbit.', topics: ['orbits', 'dynamics'], kind: 'velocity' },
];

const citationMap = new Map<string, Citation>(citations.map((c) => [c.id, c]));

function CitationMark({ id, onOpen }: { id: string; onOpen: (id: string) => void }) {
  return <button className="citation-mark" onClick={() => onOpen(id)} aria-label={`Open citation ${id}`}>[{id === 'strang' ? '1' : id === 'goldstein' ? '2' : '3'}]</button>;
}

function MathLine({ tex }: { tex: string }) {
  return <div className="math" dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { throwOnError: false }) }} />;
}

function FrameFigure() {
  const [origin, setOrigin] = useState<Point>({ x: 1.2, y: 0.8 });
  const [angle, setAngle] = useState(22);
  const width = 560; const height = 300; const scale = scaleLinear().domain([-7, 7]).range([0, 560]);
  const rad = angle * Math.PI / 180;
  const ex = { x: Math.cos(rad), y: Math.sin(rad) }; const ey = { x: -Math.sin(rad), y: Math.cos(rad) };
  const toSvg = (p: Point) => ({ x: scale(p.x), y: height / 2 - p.y * 34 });
  const p = toSvg(origin);
  return <div className="figure-card">
    <div className="figure-toolbar"><span>Interactive frame</span><label>basis rotation <input aria-label="basis rotation" type="range" min="-45" max="45" value={angle} onChange={(e) => setAngle(Number(e.target.value))} /><b>{angle}°</b></label></div>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Coordinate frame with draggable point">
      <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="currentColor" /></marker></defs>
      <g className="grid">{Array.from({ length: 17 }, (_, i) => <line key={`v${i}`} x1={i * 34 + 8} y1="0" x2={i * 34 + 8} y2={height} />)}{Array.from({ length: 9 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 34 + 10} x2={width} y2={i * 34 + 10} />)}</g>
      <line className="axis" x1="0" y1={height / 2} x2={width} y2={height / 2} markerEnd="url(#arrow)" /><line className="axis" x1={width / 2} y1={height} x2={width / 2} y2="0" markerEnd="url(#arrow)" />
      <line className="basis" x1={width / 2} y1={height / 2} x2={width / 2 + ex.x * 80} y2={height / 2 - ex.y * 80} markerEnd="url(#arrow)" /><line className="basis secondary" x1={width / 2} y1={height / 2} x2={width / 2 + ey.x * 80} y2={height / 2 - ey.y * 80} markerEnd="url(#arrow)" />
      <text x={width / 2 + ex.x * 88} y={height / 2 - ex.y * 88}>e₁</text><text x={width / 2 + ey.x * 88} y={height / 2 - ey.y * 88}>e₂</text>
      <circle className="point" cx={p.x} cy={p.y} r="8" tabIndex={0} onPointerDown={(e) => { const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect(); const move = (ev: PointerEvent) => setOrigin({ x: (ev.clientX - rect.left - width / 2) / 34, y: -(ev.clientY - rect.top - height / 2) / 34 }); window.addEventListener('pointermove', move); window.addEventListener('pointerup', () => window.removeEventListener('pointermove', move), { once: true }); }} />
      <text className="label" x={p.x + 12} y={p.y - 12}>P = ({origin.x.toFixed(1)}, {origin.y.toFixed(1)})</text>
    </svg>
    <div className="figure-caption">Drag <b>P</b> to see coordinates change with the origin held fixed. The same point has different components after the basis rotates.</div>
  </div>;
}

function VelocityFigure() {
  const [t, setT] = useState(2.4);
  const position = (time: number): Point => ({ x: 0.42 * time * time, y: 1.6 * time - 0.32 * time * time });
  const p = position(t); const v: Vector = { x: 0.84 * t, y: 1.6 - 0.64 * t };
  const origin = { x: 42, y: 190 }; const scale = 38;
  const xy = (q: Point) => ({ x: origin.x + q.x * scale, y: origin.y - q.y * scale });
  const pp = xy(p); const tip = xy(add(p, { x: v.x * 0.45, y: v.y * 0.45 }));
  const path = Array.from({ length: 45 }, (_, i) => xy(position(i / 10))).map((q) => `${q.x},${q.y}`).join(' ');
  return <div className="figure-card">
    <div className="figure-toolbar"><span>Projectile state</span><label>time <input aria-label="time" type="range" min="0" max="4.4" step="0.1" value={t} onChange={(e) => setT(Number(e.target.value))} /><b>{t.toFixed(1)} s</b></label></div>
    <svg viewBox="0 0 560 240" role="img" aria-label="Projectile path and instantaneous velocity vector"><defs><marker id="v-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#e87955" /></marker></defs><line className="axis" x1="30" y1="200" x2="540" y2="200" /><polyline className="trajectory" points={path} /><line className="velocity" x1={pp.x} y1={pp.y} x2={tip.x} y2={tip.y} markerEnd="url(#v-arrow)" /><circle className="point" cx={pp.x} cy={pp.y} r="7" /><text className="label" x={pp.x + 10} y={pp.y - 10}>r(t) = ({p.x.toFixed(2)}, {p.y.toFixed(2)}) m</text></svg>
    <div className="equation-strip"><span>v(t) = <em>dr</em>/<em>dt</em></span><span>({v.x.toFixed(2)}, {v.y.toFixed(2)}) m·s⁻¹</span><span>|v| = {magnitude(v).toFixed(2)} m·s⁻¹</span></div>
  </div>;
}

function OrbitScene() {
  return <div className="orbit-card"><Canvas camera={{ position: [4, 3, 5], fov: 45 }}><ambientLight intensity={1.5} /><mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[7, 7]} /><meshBasicMaterial color="#dbe4ed" wireframe /></mesh><mesh><sphereGeometry args={[0.3, 24, 24]} /><meshBasicMaterial color="#e87955" /></mesh><lineLoop rotation={[-Math.PI / 2, 0, 0]}><bufferGeometry><bufferAttribute attach="attributes-position" args={[new Float32Array(Array.from({ length: 64 }, (_, i) => { const a = i / 63 * Math.PI * 2; return [2.4 * Math.cos(a), 0, 1.3 * Math.sin(a)]; }).flat()), 3]} count={64} /></bufferGeometry><lineBasicMaterial color="#1c6e8c" /></lineLoop></Canvas><span className="frame-badge">Barycentric frame · ẑ up</span></div>;
}

function ArticleView({ article, onCitation, progress, onToggleArticle, onToggleExercise }: {
  article: Article;
  onCitation: (id: string) => void;
  progress: Progress;
  onToggleArticle: (slug: string) => void;
  onToggleExercise: (slug: string) => void;
}) {
  const isCoordinates = article.kind === 'coordinates';
  const articleComplete = progress.articles.includes(article.slug);
  const exerciseComplete = progress.exercises.includes(article.slug);
  return <article className="article">
    <div className="article-kicker">{article.tier} / {article.topics.join(' · ')}</div><h1>{article.title}</h1><p className="lede">{article.summary}</p>
    <div className="meta-row"><span>12 min read</span><span>Updated 04 Nov 2026</span><span className="status-dot">● template-ready</span></div>
    {isCoordinates ? <><h2>One point, three layers of meaning</h2><p>A coordinate system is not the point itself: it is an origin <i>O</i>, an ordered basis, and a unit convention. In an inertial frame, the position vector is the displacement from <i>O</i> to <i>P</i> <CitationMark id="strang" onOpen={onCitation} />. The useful engineering discipline is to name the frame in every interface, then treat a coordinate tuple as data local to that frame.</p><details open><summary>Core derivation · components from a basis</summary><div className="derivation"><p>With basis vectors e₁ and e₂, any point in the plane can be written as:</p><MathLine tex="r = x e_1 + y e_2" /><p>For a rotated orthonormal basis R(θ), the same geometric vector has coordinates r′ = Rᵀr. The transpose appears because we are changing the description while leaving the geometry fixed.</p><MathLine tex={'R(\\theta) = \\begin{bmatrix}\\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta\\end{bmatrix}'} /></div></details><FrameFigure /><h2>Applied example · robot workcells</h2><p>A pick-and-place controller can express a camera measurement in the camera frame, then transform it into the robot base frame before planning. The transform is not “just a matrix”: it encodes the declared relationship between two physical frames <CitationMark id="siciliano" onOpen={onCitation} />.</p></> : <><h2>Velocity is a local geometric object</h2><p>For a trajectory r(t), velocity is the derivative v(t) = dr/dt. It is tangent to the path, while speed is the scalar norm |v| <CitationMark id="goldstein" onOpen={onCitation} />. A velocity vector therefore carries information that a speedometer cannot: which way the state is moving.</p><details><summary>Core derivation · secant to tangent</summary><div className="derivation"><p>Start from the finite displacement over Δt and take the limit:</p><MathLine tex={'\\vec v(t) = \\lim_{\\Delta t\\to 0}\\frac{\\vec r(t+\\Delta t)-\\vec r(t)}{\\Delta t}'} /><p>For r(t) = (0.42t², 1.6t − 0.32t²), differentiation gives v(t) = (0.84t, 1.6 − 0.64t).</p></div></details><VelocityFigure /><h2>Applied example · inertial measurement units</h2><p>An IMU reports acceleration in its body frame. Integrating that signal estimates velocity, but only after rotating it into a navigation frame and accounting for gravity. Frame labels make the otherwise invisible assumptions inspectable <CitationMark id="goldstein" onOpen={onCitation} />.</p></>}
    <section className="callout"><h3>Where this shows up</h3><div className="chips">{(isCoordinates ? ['robotics', 'graphics', 'CAD', 'simulation'] : ['robotics', 'orbital mechanics', 'simulation', 'navigation']).map((x) => <span key={x}>{x}</span>)}</div></section>
    <section className="exercise"><h3>Exercise <span>▸</span></h3><p>{isCoordinates ? 'A lidar point is measured as (2, −1, 0.5) m in a sensor frame. Describe the minimum metadata required before transforming it into a world frame.' : 'A particle follows r(t) = (3 cos t, 2 sin t). At t = π/4, compute v and speed. What does the tangent tell you about the ellipse?'}</p><details><summary>Reveal solution</summary><p>{isCoordinates ? 'Record the sensor frame identifier, the world-frame identifier, the rigid transform (rotation and translation), and the units. Without all four, the tuple is underspecified.' : 'v(t) = (−3 sin t, 2 cos t), so v(π/4) = (−3/√2, 2/√2) and |v| = √(13/2). The tangent is perpendicular to the radius only for a circle; on an ellipse the speed varies.'}</p></details><button className="progress-button" type="button" aria-pressed={exerciseComplete} onClick={() => onToggleExercise(article.slug)}>{exerciseComplete ? 'Exercise complete' : 'Mark exercise complete'}</button></section>
    <button className="progress-button article-complete" type="button" aria-pressed={articleComplete} onClick={() => onToggleArticle(article.slug)}>{articleComplete ? 'Article complete' : 'Mark article complete'}</button>
  </article>;
}

function App() {
  const [selected, setSelected] = useState('coordinate-systems');
  const [tier, setTier] = useState<Tier | 'All'>('All');
  const [citationId, setCitationId] = useState<string | null>(null);
  const [showRefs, setShowRefs] = useState(false);
  const [query, setQuery] = useState('');
  const [referenceQuery, setReferenceQuery] = useState('');
  const [referenceTier, setReferenceTier] = useState<Tier | 'All'>('All');
  const [referenceTopic, setReferenceTopic] = useState('All');
  const [progress, setProgress] = useState<Progress>(readProgress);
  const search = useMemo(() => { const index = new MiniSearch({ idField: 'slug', fields: ['title', 'summary', 'topics'], storeFields: ['slug'] }); index.addAll(articles); return index; }, []);
  const results = query ? search.search(query).map((r) => articles.find((a) => a.slug === r.slug)!).filter(Boolean) : articles;
  const visible = results.filter((a) => tier === 'All' || a.tier === tier);
  const current = articles.find((a) => a.slug === selected) ?? articles[0];
  const citation = citationId ? citationMap.get(citationId) : null;
  const referenceTopics = Array.from(new Set(citations.map((citation) => citation.topic))).sort();
  const visibleReferences = citations.filter((reference) => {
    const text = `${reference.id} ${reference.author} ${reference.title} ${reference.explanation}`.toLowerCase();
    return (referenceTier === 'All' || reference.tier === referenceTier)
      && (referenceTopic === 'All' || reference.topic === referenceTopic)
      && (!referenceQuery || text.includes(referenceQuery.toLowerCase()));
  });
  const updateProgress = (update: (current: Progress) => Progress) => {
    setProgress((current) => {
      const next = update(current);
      writeProgress(next);
      return next;
    });
  };
  const toggleProgress = (key: keyof Progress, slug: string) => {
    updateProgress((current) => ({
      ...current,
      [key]: current[key].includes(slug) ? current[key].filter((item) => item !== slug) : [...current[key], slug],
    }));
  };
  const resetProgress = () => {
    setProgress(emptyProgress);
    try {
      window.localStorage.removeItem(progressKey);
    } catch {
      // Progress is optional; resetting remains harmless when storage is unavailable.
    }
  };
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#" onClick={() => setSelected('coordinate-systems')}><span className="brand-mark">∑</span><span>FIELD NOTES<small>analytic geometry / physics</small></span></a><label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search concepts, applications, symbols..." /></label><button className="outline-button" onClick={() => setShowRefs(true)}>References <span>↗</span></button></header>
    <div className="layout"><aside className="sidebar"><div className="sidebar-label">Prerequisite map</div><div className="map"><div className="map-node active"><span>01</span><b>Foundations</b><small>the language of position</small></div><div className="map-line" /><div className="map-node"><span>02</span><b>Intermediate</b><small>constraints &amp; transformations</small></div><div className="map-line" /><div className="map-node"><span>03</span><b>Advanced</b><small>motion &amp; fields</small></div></div><nav><button className={selected === 'coordinate-systems' ? 'nav-item selected' : 'nav-item'} onClick={() => setSelected('coordinate-systems')}><span>01</span>Coordinate systems</button><button className={selected === 'velocity-as-a-vector' ? 'nav-item selected' : 'nav-item'} onClick={() => setSelected('velocity-as-a-vector')}><span>02</span>Vectors as velocity</button><button className="nav-item muted" onClick={() => setTier('Intermediate')}><span>03</span>Lines &amp; planes <em>soon</em></button><button className="nav-item muted" onClick={() => setTier('Advanced')}><span>04</span>Orbital state vectors <em>soon</em></button></nav><div className="sidebar-foot"><span className="status-dot">●</span> static build / v0.1</div></aside>
      <main className="main"><div className="content-wrap"><div className="breadcrumb">FIELD NOTES <span>/</span> {current.tier.toUpperCase()} <span>/</span> ARTICLE</div><ArticleView article={current} onCitation={setCitationId} progress={progress} onToggleArticle={(slug) => toggleProgress('articles', slug)} onToggleExercise={(slug) => toggleProgress('exercises', slug)} /></div><aside className="right-rail"><div className="rail-card"><span className="sidebar-label">Progress</span><p>{progress.articles.length} of {articles.length} articles complete · {progress.exercises.length} exercises complete</p><button className="reset-progress" type="button" onClick={resetProgress}>Reset progress</button></div><div className="rail-card"><span className="sidebar-label">In this tier</span><h3>Foundations</h3><p>Two articles · 24 min</p>{articles.filter((a) => a.tier === 'Foundations').map((a) => <button key={a.slug} onClick={() => setSelected(a.slug)} className={a.slug === current.slug ? 'rail-link current' : 'rail-link'}><span>{progress.articles.includes(a.slug) ? '✓' : a.slug === current.slug ? '●' : '○'}</span>{a.title}</button>)}</div><div className="rail-card"><span className="sidebar-label">Filter map</span><div className="filter-buttons">{(['All', 'Foundations', 'Intermediate', 'Advanced'] as const).map((t) => <button key={t} className={tier === t ? 'filter active' : 'filter'} onClick={() => setTier(t)}>{t}</button>)}</div>{tier !== 'All' && <div className="search-results">{visible.map((a) => <button key={a.slug} onClick={() => setSelected(a.slug)}>{a.title}</button>)}</div>}</div><div className="rail-card glossary"><span className="sidebar-label">Notation</span><p><b>r</b> position vector</p><p><b>v</b> velocity</p><p><b>O</b> frame origin</p><p><b>R</b> rotation matrix</p></div></aside></main>
    </div>
    {citation && <div className="drawer-backdrop" onClick={() => setCitationId(null)}><aside className="citation-drawer" role="dialog" aria-modal="true" aria-labelledby="citation-title" onClick={(e) => e.stopPropagation()}><button className="close" type="button" aria-label="Close source note" onClick={() => setCitationId(null)}>×</button><span className="sidebar-label">Source note</span><div className="citation-id">{citation.id}</div><h2 id="citation-title">{citation.title}</h2><p className="citation-author">{citation.author} · {citation.publisher}, {citation.year}</p><p>{citation.explanation}</p><a href={citation.url} target="_blank" rel="noreferrer">Open source ↗</a></aside></div>}
    {showRefs && <div className="drawer-backdrop" onClick={() => setShowRefs(false)}><aside className="references-panel" role="dialog" aria-modal="true" aria-labelledby="references-title" onClick={(e) => e.stopPropagation()}><button className="close" type="button" aria-label="Close references" onClick={() => setShowRefs(false)}>×</button><span className="sidebar-label">Registry</span><h2 id="references-title">References</h2><p className="lede">Every source used in the wiki, with its contribution made explicit.</p><button className="export-button" type="button" onClick={downloadBibtex}>Download BibTeX</button><div className="reference-toolbar"><label htmlFor="reference-search">Search references</label><input id="reference-search" value={referenceQuery} onChange={(e) => setReferenceQuery(e.target.value)} placeholder="Author, title, explanation..." /><div className="reference-filters"><span>Tier</span>{(['All', 'Foundations', 'Intermediate', 'Advanced'] as const).map((t) => <button type="button" key={t} className={referenceTier === t ? 'filter active' : 'filter'} aria-pressed={referenceTier === t} onClick={() => setReferenceTier(t)}>{t}</button>)}</div><label htmlFor="reference-topic">Topic</label><select id="reference-topic" value={referenceTopic} onChange={(e) => setReferenceTopic(e.target.value)}><option>All</option>{referenceTopics.map((topic) => <option key={topic}>{topic}</option>)}</select></div>{visibleReferences.length === 0 && <p className="empty-results">No references match the current filters.</p>}{visibleReferences.map((c) => <div className="reference-entry" key={c.id}><div><span className="citation-id">{c.id}</span><span className="reference-topic">{c.tier} · {c.topic}</span></div><h3>{c.title}</h3><p>{c.author} · {c.year}</p><small>{c.explanation}</small>{c.doi && <a className="reference-link" href={`https://doi.org/${c.doi}`} target="_blank" rel="noreferrer">DOI ↗</a>}{c.url && !c.doi && <a className="reference-link" href={c.url} target="_blank" rel="noreferrer">Open source ↗</a>}</div>)}</aside></div>}
  </div>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
