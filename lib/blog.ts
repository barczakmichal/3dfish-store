import fs from 'fs';
import path from 'path';

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  tags: string[];
  content: string;
}

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

function parseMarkdownMeta(raw: string): BlogPost {
  const lines = raw.split('\n');

  // Title is always line 1 (# heading)
  const title = lines[0].replace(/^#\s+/, '');

  let metaTitle = '';
  let metaDescription = '';
  let slug = '';
  let category = '';
  let tags: string[] = [];
  let contentStartIndex = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('**Meta title:**')) {
      metaTitle = line.replace('**Meta title:**', '').trim();
    } else if (line.startsWith('**Meta description:**')) {
      metaDescription = line.replace('**Meta description:**', '').trim();
    } else if (line.startsWith('**Slug:**')) {
      slug = line.replace('**Slug:**', '').trim();
    } else if (line.startsWith('**Kategoria:**')) {
      category = line.replace('**Kategoria:**', '').trim();
    } else if (line.startsWith('**Tagi:**')) {
      tags = line
        .replace('**Tagi:**', '')
        .trim()
        .split(',')
        .map((t) => t.trim());
    } else if (line.trim() === '---') {
      contentStartIndex = i + 1;
      break;
    }
  }

  const content = lines.slice(contentStartIndex).join('\n').trim();

  return { slug, title, metaTitle, metaDescription, category, tags, content };
}

export function getAllPosts(): BlogPost[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    return parseMarkdownMeta(raw);
  });
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}
