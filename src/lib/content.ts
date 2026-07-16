import { getCollection, type CollectionEntry } from 'astro:content';
import { sectionForType, sortNodes, type SectionKey } from './taxonomy';

export type Node = CollectionEntry<'nodes'>;
export type NodeStatus = Node['data']['status'];

const VISIBLE_STATUSES: NodeStatus[] = import.meta.env.PROD ? ['published'] : ['published', 'draft'];

export function isPublishedNode(node: Node) {
  return node.data.status === 'published';
}

export function isVisibleNode(node: Node) {
  return VISIBLE_STATUSES.includes(node.data.status);
}

export async function getAllNodes() {
  return sortNodes(await getCollection('nodes'));
}

export async function getPublishedNodes() {
  return sortNodes((await getCollection('nodes')).filter(isPublishedNode));
}

export async function getVisibleNodes() {
  return sortNodes((await getCollection('nodes')).filter(isVisibleNode));
}

export async function getNodesByType(type: Node['data']['type'], nodes?: Node[]) {
  const source = nodes ?? await getVisibleNodes();
  return sortNodes(source.filter((node) => node.data.type === type));
}

export async function getNodesBySection(section: SectionKey, nodes?: Node[]) {
  const source = nodes ?? await getVisibleNodes();
  return sortNodes(source.filter((node) => sectionForType(node.data.type) === section));
}

export async function getNodesByTag(tag: string, nodes?: Node[]) {
  const source = nodes ?? await getVisibleNodes();
  return sortNodes(source.filter((node) => node.data.tags.includes(tag)));
}

export function explicitRelated(node: Node, all: Node[]) {
  const bySlug = new Map(all.map((n) => [n.data.slug, n]));
  return node.data.relatedNodes.map((slug) => bySlug.get(slug)).filter(Boolean) as Node[];
}

export function suggestedRelated(node: Node, all: Node[], limit = 5) {
  const explicit = new Set(node.data.relatedNodes);
  const tags = new Set(node.data.tags);
  return all
    .filter((n) => n.data.slug !== node.data.slug && !explicit.has(n.data.slug))
    .map((n) => ({ n, score: n.data.tags.filter((tag) => tags.has(tag)).length }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.n.data.title.localeCompare(b.n.data.title, 'es'))
    .slice(0, limit)
    .map(({ n }) => n);
}

export function getFeaturedNodes(nodes: Node[], limit = 4) {
  const featured = nodes.filter((node) => node.data.featured);
  const source = featured.length ? featured : nodes;
  return sortNodes(source).slice(0, limit);
}
