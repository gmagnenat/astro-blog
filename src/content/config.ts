import { defineCollection } from 'astro:content';
import { postSchema } from '../schemas/PostSchema';
import { jobSchema } from '../schemas/JobSchema';

const postCollection = defineCollection({
    type: 'content',
    schema: postSchema
});

const jobCollection = defineCollection({
    type: 'content',
    schema: jobSchema
})

export const collections = {
    posts: postCollection,
    jobs: jobCollection,
};