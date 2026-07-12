import { z } from 'astro/zod';

export const linkedInSchema = z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string(),
    url: z.string().url(),
    draft: z.boolean().default(false),
});
