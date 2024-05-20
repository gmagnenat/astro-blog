import { z, type SchemaContext } from 'astro:content';

export const imageSchema = ({ image }: SchemaContext) =>
    z.object({
        src: image(),
        alt: z.string(),
    });

export const postSchema = ({ image }: { image: any }) => z.object({
    title: z.string(),
    description: z.string().optional(),
    publishedDate: z.string().or(z.date()).transform((str) => new Date(str)),
    featured: z.boolean().default(false),
    draft: z.boolean().default(true),
    postimage: imageSchema({ image }).optional(),
});

