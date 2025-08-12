import { getToken } from 'next-auth/jwt';
import dbConnect from '../../../lib/mongodb';
import Article from '../../../models/Article';
import Project from '../../../models/Project';

const handler = async (req, res) => {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      await dbConnect();

      const articles = await Article.find({}, 'title views slug').sort({ views: -1 });
      const projects = await Project.find({}, 'title views slug').sort({ views: -1 });

      const totalArticleViews = articles.reduce((acc, article) => acc + article.views, 0);
      const totalProjectViews = projects.reduce((acc, project) => acc + project.views, 0);
      const totalViews = totalArticleViews + totalProjectViews;

      const mostViewedArticle = articles.length > 0 ? articles[0] : null;
      const mostViewedProject = projects.length > 0 ? projects[0] : null;

      res.status(200).json({
        totalViews,
        totalArticleViews,
        totalProjectViews,
        mostViewedArticle,
        mostViewedProject,
        articles,
        projects,
      });
    } catch (error) {
      console.error('Error fetching analytics stats:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
