import * as slug from 'slug';

export function slugify(text: string): string {
  return slug(text, '-');
}
