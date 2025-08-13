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
      const rangeDays = Math.max(0, parseInt(req.query.range || '0', 10) || 0);
      const now = new Date();
      const fromDate = rangeDays > 0 ? new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000) : null;

      const articleStats = await Article.aggregate([
        { $group: { _id: '$published', count: { $sum: 1 } } },
      ]);

      const projectStats = await Project.aggregate([
        { $group: { _id: '$published', count: { $sum: 1 } } },
      ]);

      const dateMatch = fromDate ? { $match: { createdAt: { $gte: fromDate } } } : null;
      const articlesByDate = await Article.aggregate([
        ...(dateMatch ? [dateMatch] : []),
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);
      const projectsByDate = await Project.aggregate([
        ...(dateMatch ? [dateMatch] : []),
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);

      // KPIs
      const [totalArticles, totalProjects] = await Promise.all([
        Article.countDocuments(fromDate ? { createdAt: { $gte: fromDate } } : {}),
        Project.countDocuments(fromDate ? { createdAt: { $gte: fromDate } } : {}),
      ]);
      const [publishedArticles, publishedProjects] = await Promise.all([
        Article.countDocuments(fromDate ? { published: true, createdAt: { $gte: fromDate } } : { published: true }),
        Project.countDocuments(fromDate ? { published: true, createdAt: { $gte: fromDate } } : { published: true }),
      ]);

      // Tag breakdowns
      const articleTags = await Article.aggregate([
        { $unwind: { path: '$tags', preserveNullAndEmptyArrays: false } },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]);
      const projectTags = await Project.aggregate([
        { $unwind: { path: '$tags', preserveNullAndEmptyArrays: false } },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]);

      // Category breakdown (projects)
      const projectCategories = await Project.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      // Top viewed
      const topViewedFilter = fromDate ? { createdAt: { $gte: fromDate } } : {};
      const topViewedArticles = await Article.find(topViewedFilter).sort({ views: -1 }).limit(5).select('title slug views createdAt').lean();
      const topViewedProjects = await Project.find(topViewedFilter).sort({ views: -1 }).limit(5).select('title slug views createdAt').lean();

      // Recent
      const recentFilter = fromDate ? { createdAt: { $gte: fromDate } } : {};
      const recentArticles = await Article.find(recentFilter).sort({ createdAt: -1 }).limit(5).select('title slug createdAt published').lean();
      const recentProjects = await Project.find(recentFilter).sort({ createdAt: -1 }).limit(5).select('title slug createdAt published').lean();

      res.status(200).json({
        success: true,
        data: {
          articleStats,
          projectStats,
          articlesByDate,
          projectsByDate,
          kpis: {
            totalArticles,
            totalProjects,
            publishedArticles,
            publishedProjects,
          },
          articleTags,
          projectTags,
          projectCategories,
          topViewedArticles,
          topViewedProjects,
          recentArticles,
          recentProjects,
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
