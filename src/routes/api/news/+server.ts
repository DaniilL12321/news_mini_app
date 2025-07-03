import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  database: process.env.DB_DATABASE
});

export const GET: RequestHandler = async ({ url }: { url: URL }) => {
  try {
    const sortBy = url.searchParams.get('sort') || 'date';
    const search = url.searchParams.get('search')?.toLowerCase();

    let query = `
      SELECT n.*, 
             COUNT(CASE WHEN r.reaction_type = 'like' THEN 1 END) as likes_count,
             COUNT(CASE WHEN r.reaction_type = 'dislike' THEN 1 END) as dislikes_count
      FROM news n
      LEFT JOIN reactions r ON n.id = r."newsId"
    `;

    if (search) {
      query += `
        WHERE LOWER(n.title) LIKE $1 OR LOWER(n.content) LIKE $1
      `;
    }

    query += `
      GROUP BY n.id
    `;

    if (sortBy === 'popularity') {
      query += `
        ORDER BY (COUNT(CASE WHEN r.reaction_type = 'like' THEN 1 END) - 
                 COUNT(CASE WHEN r.reaction_type = 'dislike' THEN 1 END)) DESC,
                n.date DESC
      `;
    } else {
      query += `
        ORDER BY n.date DESC
      `;
    }

    const result = search
      ? await pool.query(query, [`%${search}%`])
      : await pool.query(query);

    return json(result.rows);
  } catch (error) {
    console.error('Error fetching news:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch news' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 