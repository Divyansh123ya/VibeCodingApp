import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.STORAGE_URL);

  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT order_data FROM orders ORDER BY created_at DESC`;
      return res.status(200).json(rows.map((r) => r.order_data));
    }

    if (req.method === 'POST') {
      const order = req.body;
      await sql`
        INSERT INTO orders (id, order_data)
        VALUES (${order.id}, ${JSON.stringify(order)}::jsonb)
      `;
      return res.status(201).json(order);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}