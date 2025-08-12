import { getSession } from 'next-auth/react';
import dbConnect from '../../../../lib/mongoose';
import Article from '../../../../models/Article';
import Project from '../../../../models/Project';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session || !['admin', 'editor'].includes(session.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  if (req.method === 'GET') {
    try {
      await dbConnect();

      const articleStats = await Article.aggregate([
        { $group: { _id: '$published', count: { $sum: 1 } } },
      ]);

      const projectStats = await Project.aggregate([
        { $group: { _id: '$published', count: { $sum: 1 } } },
      ]);

      const articlesByDate = await Article.aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);

      res.status(200).json({
        success: true,
        data: {
          articleStats,
          projectStats,
          articlesByDate,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
