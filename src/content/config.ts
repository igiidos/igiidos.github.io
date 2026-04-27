import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['running', 'marathon', 'trail', 'tech', 'travel']),
    tags: z.array(z.string()).optional(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    ogshot: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
