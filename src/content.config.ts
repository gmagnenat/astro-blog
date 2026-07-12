import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { postSchema } from './schemas/PostSchema';
import { jobSchema } from './schemas/JobSchema';
import { linkedInSchema } from './schemas/LinkedInSchema';

const postCollection = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
    schema: postSchema,
});

const jobCollection = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/jobs' }),
    schema: jobSchema,
});

const linkedInCollection = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/linkedin' }),
    schema: linkedInSchema,
});

export const collections = {
    posts: postCollection,
    jobs: jobCollection,
    linkedin: linkedInCollection,
};
