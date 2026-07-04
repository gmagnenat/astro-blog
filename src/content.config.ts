import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { postSchema } from './schemas/PostSchema';
import { jobSchema } from './schemas/JobSchema';

const postCollection = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
    schema: postSchema,
});

const jobCollection = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/jobs' }),
    schema: jobSchema,
});

export const collections = {
    posts: postCollection,
    jobs: jobCollection,
};
