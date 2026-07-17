import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const dist = 'dist';
const nodesDir = 'src/content/nodes';

function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  return Object.fromEntries(match[1].split('\n').map((line) => {
    const i = line.indexOf(':');
    if (i === -1) return null;
    return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')];
  }).filter(Boolean));
}

async function readHtml(...parts) {
  return readFile(path.join(dist, ...parts), 'utf8');
}

const files = (await readdir(nodesDir)).filter((file) => file.endsWith('.md'));
const nodes = [];
for (const file of files) {
  const data = frontmatter(await readFile(path.join(nodesDir, file), 'utf8'));
  nodes.push({ file, ...data });
}
const published = nodes.filter((node) => node.status === 'published');
const drafts = nodes.filter((node) => node.status === 'draft');
const classificationCode = /\b(?:OBR|PER|CON|HIS|ENS)-(?:MOV|SER|BOO|AUT|DIR|PER|CHA|CON|MOV|ESS|HIS|TEC|CUL)-[A-Z0-9]{3}\b/;

if (published.length === 0) throw new Error('No hay nodos publicados para comprobar.');

const archiveHtml = await readHtml('archivo', 'index.html');
const checks = [
  ['index.html', await readHtml('index.html'), ['Nodos destacados', published[0].title]],
  ['archivo/index.html', archiveHtml, [...published.map((node) => node.title), 'Buscar en el archivo', 'No se encontraron nodos para esta búsqueda.']],
  ['archivo/seccion/obras/index.html', await readHtml('archivo', 'seccion', 'obras', 'index.html'), ['Back to the Future', 'Blade Runner', 'Fundación']],
  ['archivo/seccion/personas/index.html', await readHtml('archivo', 'seccion', 'personas', 'index.html'), ['Isaac Asimov', 'Philip K. Dick', 'Robert Zemeckis']],
];

for (const [label, html, needles] of checks) {
  if (classificationCode.test(html)) throw new Error(`${label} contiene un código de clasificación visible.`);
  for (const needle of needles) {
    if (!html.includes(needle)) throw new Error(`${label} no contiene ${needle}`);
  }
  for (const draft of drafts) {
    if (html.includes(draft.title) || html.includes(draft.slug)) throw new Error(`${label} contiene el borrador ${draft.slug}`);
  }
}

try {
  await access(path.join(dist, 'buscar', 'index.html'));
  throw new Error('La página independiente /buscar todavía fue generada.');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

if (archiveHtml.includes('href="/buscar"') || archiveHtml.includes('Buscador local')) {
  throw new Error('El archivo conserva referencias a la página independiente de búsqueda.');
}

for (const node of published) {
  const html = await readHtml('archivo', node.slug, 'index.html');
  if (!html.includes(node.title)) throw new Error(`La página individual de ${node.slug} no contiene su título.`);
  if (classificationCode.test(html)) throw new Error(`La página individual de ${node.slug} contiene un código de clasificación visible.`);
}

console.log(`Comprobación OK: ${published.length} nodos publicados; borradores excluidos: ${drafts.map((node) => node.file).join(', ') || 'ninguno'}.`);
