import { defineCollection } from 'astro:content';
import { postSchema } from '../schemas/PostSchema';

const postCollection = defineCollection({
    type: 'content',
    schema: postSchema
});

export const collections = {
    posts: postCollection
};