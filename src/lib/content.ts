import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublished, sortNodes } from './taxonomy';
export type Node = CollectionEntry<'nodes'>;
export async function getVisibleNodes() { return sortNodes((await getCollection('nodes')).filter(isPublished)); }
export function explicitRelated(node: Node, all: Node[]) { const bySlug = new Map(all.map(n => [n.data.slug, n])); return node.data.relatedNodes.map(s => bySlug.get(s)).filter(Boolean) as Node[]; }
export function suggestedRelated(node: Node, all: Node[], limit = 5) {
  const explicit = new Set(node.data.relatedNodes);
  const tags = new Set(node.data.tags);
  return all.filter(n => n.data.slug !== node.data.slug && !explicit.has(n.data.slug))
    .map(n => ({ n, score: n.data.tags.filter(t => tags.has(t)).length }))
    .filter(x => x.score > 0).sort((a,b) => b.score - a.score || a.n.data.title.localeCompare(b.n.data.title, 'es')).slice(0, limit).map(x => x.n);
}
