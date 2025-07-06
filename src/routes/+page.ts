import type { PageLoad } from './$types';

export const load = (async ({ fetch, url }: { fetch: (input: RequestInfo) => Promise<Response>, url: URL }) => {
  try {
    const searchQuery = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sort') || 'date';

    const searchParams = new URLSearchParams();
    if (searchQuery) searchParams.set('search', searchQuery);
    if (sortBy) searchParams.set('sort', sortBy);

    const response = await fetch(`/api/news?${searchParams.toString()}`);
    const data = await response.json();
    return { 
      ...data,
      searchQuery, 
      sortBy 
    };
  } catch (error) {
    console.error('Error loading news:', error);
    return {
      items: [],
      isCache: false,
      error: 'Failed to load news',
      searchQuery: '',
      sortBy: 'date'
    };
  }
}); 