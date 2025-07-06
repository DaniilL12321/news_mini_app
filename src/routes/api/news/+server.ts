import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import pg from 'pg';
import Redis from 'ioredis';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  database: process.env.DB_DATABASE
});

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD,
});

export const GET: RequestHandler = async ({ url }: { url: URL }) => {
  try {
    const sortBy = url.searchParams.get('sort') || 'date';
    const search = url.searchParams.get('search')?.toLowerCase();

    const cacheKey = `news:${sortBy}:${search || 'all'}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return json({
        isCache: true,
        items: JSON.parse(cachedData)
      });
    }

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

    await redis.set(cacheKey, JSON.stringify(result.rows), 'EX', 300);

    return json({
      isCache: false,
      items: result.rows
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch news',
      isCache: false,
      items: []
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 