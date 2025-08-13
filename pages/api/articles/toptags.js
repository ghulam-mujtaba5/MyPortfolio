import dbConnect from '../../../lib/mongoose';
import Article from '../../../models/Article';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  try {
    await dbConnect();

    const topTags = await Article.aggregate([
      { $match: { published: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, tag: '$_id' } },
    ]);

    res.status(200).json({ success: true, data: topTags.map(t => t.tag) });
  } catch (err) {
    console.error('Top tags API error:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}
