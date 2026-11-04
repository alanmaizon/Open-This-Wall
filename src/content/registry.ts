export type Tier = 'Foundations' | 'Intermediate' | 'Advanced';
export type ArticleKind = 'coordinates' | 'velocity';

export type Article = {
  slug: string;
  tier: Tier;
  title: string;
  summary: string;
  topics: string[];
  kind: ArticleKind;
  readingTime: number;
  prerequisites: string[];
  published: boolean;
  body: string;
};

const articleFiles = import.meta.glob('./articles/*.mdx', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const validTiers: Tier[] = ['Foundations', 'Intermediate', 'Advanced'];
const validKinds: ArticleKind[] = ['coordinates', 'velocity'];

function parseList(value: string | undefined) {
  return value?.replace(/^\[|\]$/g, '').split(',').map((item) => item.trim()).filter(Boolean) ?? [];
}

function parseArticle(source: string, path: string): Article {
  const match = source.match(/^---\n([\s\S]*?)\n---\s*([\s\S]*)$/m);
  if (!match) throw new Error(`Missing frontmatter in ${path}`);
  const fields = Object.fromEntries(match[1].split('\n').map((line) => {
    const separator = line.indexOf(':');
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
  }));
  const tier = fields.tier as Tier;
  const kind = fields.kind as ArticleKind;
  const prerequisites = parseList(fields.prerequisites);
  if (!fields.slug || !validTiers.includes(tier) || !fields.title || !fields.summary
    || !validKinds.includes(kind) || !fields.readingTime || !fields.published) {
    throw new Error(`Incomplete or invalid frontmatter in ${path}`);
  }
  return {
    slug: fields.slug,
    tier,
    title: fields.title,
    summary: fields.summary,
    topics: parseList(fields.topics),
    kind,
    readingTime: Number(fields.readingTime),
    prerequisites,
    published: fields.published === 'true',
    body: match[2].trim(),
  };
}

export const articles = Object.entries(articleFiles)
  .map(([path, source]) => parseArticle(source, path))
  .filter((article) => article.published)
  .sort((a, b) => a.tier.localeCompare(b.tier) || a.title.localeCompare(b.title));

export const tiers: Tier[] = validTiers;

