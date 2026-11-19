import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.STORAGE_URL);

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT product_id, review_data FROM reviews ORDER BY created_at DESC`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { productId, review } = req.body;
      await sql`
        INSERT INTO reviews (id, product_id, review_data)
        VALUES (${review.id}, ${productId}, ${JSON.stringify(review)}::jsonb)
      `;
      return res.status(201).json({ productId, review });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}