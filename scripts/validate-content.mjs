import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const articlesDirectory = new URL('../src/content/articles/', import.meta.url);
const citationsPath = new URL('../src/citations.json', import.meta.url);
const requiredFields = ['slug', 'tier', 'title', 'summary', 'topics', 'kind'];
const citations = JSON.parse(await readFile(citationsPath, 'utf8'));
const citationMap = new Map(citations.map((citation) => [citation.id, citation]));
const files = (await readdir(articlesDirectory)).filter((file) => file.endsWith('.mdx'));
const errors = [];

for (const file of files) {
  const path = join(articlesDirectory.pathname, file);
  const source = await readFile(path, 'utf8');
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/m)?.[1];
  if (!frontmatter) {
    errors.push(`${file}: missing frontmatter`);
    continue;
  }
  const fields = Object.fromEntries(frontmatter.split('\n').map((line) => {
    const separator = line.indexOf(':');
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
  }));
  for (const field of requiredFields) {
    if (!fields[field]) errors.push(`${file}: missing required field "${field}"`);
  }
  for (const [, id] of source.matchAll(/\b(?:citation|cite|CitationMark)\s*(?:id\s*=\s*)?["'{`]([a-z0-9-]+)["'}`]/gi)) {
    if (!citationMap.has(id)) errors.push(`${file}: citation "${id}" is missing from src/citations.json`);
  }
}

for (const citation of citations) {
  if (!citation.explanation?.trim()) errors.push(`citation "${citation.id}": missing explanation`);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${files.length} articles and ${citations.length} citations.`);
}
