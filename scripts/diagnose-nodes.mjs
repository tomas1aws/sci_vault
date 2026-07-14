import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const nodesDir = 'src/content/nodes';
const sectionsByType = {
  movie: 'Obras',
  series: 'Obras',
  book: 'Obras',
  author: 'Personas',
  director: 'Personas',
  person: 'Personas',
  character: 'Conceptos',
  concept: 'Conceptos',
  movement: 'Conceptos',
  technology: 'Conceptos',
  culture: 'Conceptos',
  history: 'Historia',
  essay: 'Ensayos',
};

function parseValue(value) {
  value = value.trim();
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^\d+$/.test(value)) return Number(value);
  if (value.startsWith('[')) return [...value.matchAll(/"([^"]+)"|'([^']+)'/g)].map((match) => match[1] || match[2]);
  return value.replace(/^["']|["']$/g, '');
}

function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error('Frontmatter ausente');
  const data = {};
  for (const line of match[1].split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const index = line.indexOf(':');
    if (index === -1) continue;
    data[line.slice(0, index).trim()] = parseValue(line.slice(index + 1));
  }
  return data;
}

const files = (await readdir(nodesDir)).filter((file) => /\.mdx?$/.test(file)).sort();
const nodes = [];
for (const file of files) {
  const data = frontmatter(await readFile(path.join(nodesDir, file), 'utf8'));
  nodes.push({ file, section: sectionsByType[data.type] ?? 'Ensayos', ...data });
}

const count = (predicate) => nodes.filter(predicate).length;
console.log(`Total de entradas encontradas en nodes: ${nodes.length}`);
for (const node of nodes.sort((a, b) => a.title.localeCompare(b.title, 'es'))) {
  console.log(`- ${node.title} | slug=${node.slug} | type=${node.type} | status=${node.status} | sección=${node.section}`);
}
console.log(`Publicados: ${count((node) => node.status === 'published')}`);
console.log(`Borradores: ${count((node) => node.status === 'draft')}`);
console.log(`Obras: ${count((node) => node.section === 'Obras')}`);
console.log(`Personas: ${count((node) => node.section === 'Personas')}`);
console.log(`Conceptos: ${count((node) => node.section === 'Conceptos')}`);
console.log(`Historia: ${count((node) => node.section === 'Historia')}`);
console.log(`Destacados: ${count((node) => node.featured === true)}`);
