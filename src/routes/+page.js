/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  try {
    const response = await fetch('/api/news');
    const news = await response.json();
    return { news };
  } catch (error) {
    console.error('Error loading news:', error);
    return {
      news: [],
      error: 'Failed to load news'
    };
  }
} 