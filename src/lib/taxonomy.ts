import type { CollectionEntry } from 'astro:content';

export type Node = CollectionEntry<'nodes'>;
export type NodeType = Node['data']['type'];
export type SectionKey = 'obras' | 'personas' | 'conceptos' | 'historia' | 'ensayos';

export const sections: Record<SectionKey, { title: string; description: string }> = {
  obras: { title: 'Obras', description: 'Películas, series y libros como puertas de entrada al archivo.' },
  personas: { title: 'Personas', description: 'Autorías, direcciones y figuras que modelaron el imaginario.' },
  conceptos: { title: 'Conceptos', description: 'Ideas, tecnologías, personajes y corrientes del género.' },
  historia: { title: 'Historia', description: 'Recorridos históricos y contextos culturales.' },
  ensayos: { title: 'Ensayos', description: 'Lecturas transversales y conexiones interpretativas.' }
};

export const typeLabels: Record<NodeType, string> = {
  movie: 'Película', series: 'Serie', book: 'Libro', author: 'Autor/a', director: 'Director/a', person: 'Persona', character: 'Personaje', concept: 'Concepto', movement: 'Corriente', essay: 'Ensayo', history: 'Historia', technology: 'Tecnología', culture: 'Cultura'
};

export function sectionForType(type: NodeType): SectionKey {
  if (['movie', 'series', 'book'].includes(type)) return 'obras';
  if (['author', 'director', 'person'].includes(type)) return 'personas';
  if (['concept', 'movement', 'character', 'technology', 'culture'].includes(type)) return 'conceptos';
  if (type === 'history') return 'historia';
  return 'ensayos';
}

export function nodeUrl(slug: string) { return `/archivo/${slug}`; }
export function isPublished(node: Node) { return import.meta.env.PROD ? node.data.status === 'published' : true; }
export function archiveCode(node: Node) { return `${sectionForType(node.data.type).slice(0,3).toUpperCase()}-${node.data.type.slice(0,3).toUpperCase()}-${node.data.slug.slice(0,3).toUpperCase()}`; }

export function sortNodes(nodes: Node[]) { return [...nodes].sort((a, b) => a.data.title.localeCompare(b.data.title, 'es')); }
