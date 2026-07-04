import { z } from 'astro/zod';
import type { SchemaContext } from 'astro/content/config';

export const imageSchema = ({ image }: SchemaContext) =>
    z.object({
        src: image(),
        alt: z.string(),
    });

export const postSchema = ({ image }: { image: any }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()),
    publishedDate: z.string().or(z.date()).transform((str) => new Date(str)),
    featured: z.boolean().default(false),
    draft: z.boolean().default(true),
    postSeoImage: z.string(),
    postimage: imageSchema({ image }).optional(),
});

