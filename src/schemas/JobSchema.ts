import { z } from 'astro:content';

export const jobSchema = ()  => z.object({
    title: z.string(),
    employer: z.string(),
    timeline: z.string(),
    tags: z.array(z.string()),
    draft: z.boolean().default(true),
});