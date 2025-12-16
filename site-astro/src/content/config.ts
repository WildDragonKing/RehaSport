import { defineCollection, z } from 'astro:content';

const sessions = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    beschreibung: z.string().optional(),
    dauer: z.string().optional(),
    fokus: z.string().optional(),
  }),
});

const exercises = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
  }),
});

export const collections = { sessions, exercises };
