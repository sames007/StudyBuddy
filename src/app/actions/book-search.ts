'use server';

import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().trim().min(2, 'Search query must be at least 2 characters.').max(120),
});

interface Book {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  edition_count: number;
  cover_i?: number;
}

interface SearchResult {
  num_found: number;
  start: number;
  docs: Book[];
  query?: string;
  error?: string;
}

export async function searchBooks(
  _prevState: SearchResult,
  formData: FormData
): Promise<SearchResult> {
  const validatedFields = searchSchema.safeParse({
    query: formData.get('query'),
  });

  if (!validatedFields.success) {
    return {
      num_found: 0,
      start: 0,
      docs: [],
      error: 'Invalid input.',
    };
  }

  const { query } = validatedFields.data;
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
    query
  )}&fields=key,title,author_name,first_publish_year,edition_count,cover_i&limit=12`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data: SearchResult = await response.json();
    return {...data, query};
  } catch (e: unknown) {
    console.error('Open Library API error:', e);
    return {
      num_found: 0,
      start: 0,
      docs: [],
      query,
      error: e instanceof Error ? e.message : 'Failed to search for books. Please try again.',
    };
  }
}
