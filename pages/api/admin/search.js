import { getToken } from 'next-auth/jwt';
import dbConnect from '../../../lib/mongoose';
import Article from '../../../models/Article';

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !['admin', 'editor'].includes(token.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const { q = '', limit = 10 } = req.query;
  const query = String(q).trim();
  if (!query) return res.status(400).json({ success: false, message: 'Search query is required' });

  try {
    await dbConnect();
    const regex = new RegExp(query, 'i');

    const results = await Article.find({
      $or: [
        { title: regex },
        { tags: regex },
        { categories: regex },
      ],
    })
      .select({ _id: 1, title: 1, slug: 1, published: 1, publishAt: 1, createdAt: 1 })
      .limit(Math.min(50, Math.max(1, parseInt(limit, 10) || 10)))
      .lean();

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error('Admin Search API error:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
}
