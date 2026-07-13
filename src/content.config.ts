import { defineCollection, z } from 'astro:content';

export const nodeTypes = [
  'movie','series','book','author','director','person','character','concept','movement','essay','history','technology','culture'
] as const;

const nodes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    type: z.enum(nodeTypes),
    description: z.string().min(1),
    year: z.number().int().optional(),
    tags: z.array(z.string()).default([]),
    relatedNodes: z.array(z.string()).default([]),
    aliases: z.array(z.string()).optional(),
    status: z.enum(['draft', 'published']),
    spoilerLevel: z.string().optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date()
  })
});

export const collections = { nodes };
