import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const POSTS_DIR = join(process.cwd(), 'src/content/posts');
const DIST_DIR = join(process.cwd(), 'dist');

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error('no frontmatter block found');
  }
  const frontmatter = match[1];
  const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/);
  const tags = tagsMatch
    ? tagsMatch[1]
        .split(',')
        .map((tag) => tag.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    : [];
  return { tags };
}

function getPosts() {
  const files = readdirSync(POSTS_DIR).filter((file) => file.endsWith('.md'));
  return files.map((file) => {
    const raw = readFileSync(join(POSTS_DIR, file), 'utf-8');
    const { tags } = parseFrontmatter(raw);
    return { slug: file.replace(/\.md$/, ''), tags };
  });
}

describe('build output', () => {
  const staticPages = [
    'index.html',
    'about/index.html',
    'cv/index.html',
    'posts/index.html',
    'postscollection/index.html',
  ];

  it.each(staticPages)('generates dist/%s', (page) => {
    expect(existsSync(join(DIST_DIR, page))).toBe(true);
  });

  it('generates dist/robots.txt', () => {
    expect(existsSync(join(DIST_DIR, 'robots.txt'))).toBe(true);
  });

  const posts = getPosts();

  it.each(posts.map((post) => post.slug))('generates dist/post/%s/index.html', (slug) => {
    expect(existsSync(join(DIST_DIR, 'post', slug, 'index.html'))).toBe(true);
  });

  const tags = [...new Set(posts.flatMap((post) => post.tags))];

  it.each(tags)('generates dist/post/tags/%s/index.html', (tag) => {
    expect(existsSync(join(DIST_DIR, 'post', 'tags', tag, 'index.html'))).toBe(true);
  });
});
