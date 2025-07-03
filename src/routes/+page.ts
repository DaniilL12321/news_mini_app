import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
  try {
    const searchQuery = url.searchParams.get('search') || '';
    const sortBy = url.searchParams.get('sort') || 'date';

    const searchParams = new URLSearchParams();
    if (searchQuery) searchParams.set('search', searchQuery);
    if (sortBy) searchParams.set('sort', sortBy);

    const response = await fetch(`/api/news?${searchParams.toString()}`);
    const news = await response.json();
    return { news, searchQuery, sortBy };
  } catch (error) {
    console.error('Error loading news:', error);
    return {
      news: [],
      error: 'Failed to load news',
      searchQuery: '',
      sortBy: 'date'
    };
  }
}; 