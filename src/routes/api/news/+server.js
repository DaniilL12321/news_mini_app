import { json } from '@sveltejs/kit';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE
});

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT n.*, 
             COUNT(CASE WHEN r.reaction_type = 'like' THEN 1 END) as likes_count,
             COUNT(CASE WHEN r.reaction_type = 'dislike' THEN 1 END) as dislikes_count
      FROM news n
      LEFT JOIN reactions r ON n.id = r."newsId"
      GROUP BY n.id
      ORDER BY n.date DESC
    `);
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
} 