import { mongooseConnect } from '../../../lib/mongoose';
import { getSession } from 'next-auth/react';
import Article from '../../../models/Article';
import Project from '../../../models/Project';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getSession({ req });
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await mongooseConnect();

  const { q: searchQuery } = req.query;

  if (!searchQuery) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  const regex = new RegExp(searchQuery, 'i');

  try {
    const [articles, projects, users] = await Promise.all([
      Article.find({ title: regex }).select('_id title slug').limit(5),
      Project.find({ title: regex }).select('_id title slug').limit(5),
      User.find({ name: regex }).select('_id name email').limit(5),
    ]);

    const results = [
      ...articles.map(item => ({ ...item._doc, type: 'Article' })),
      ...projects.map(item => ({ ...item._doc, type: 'Project' })),
      ...users.map(item => ({ ...item._doc, type: 'User' })),
    ];

    res.status(200).json(results);
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
