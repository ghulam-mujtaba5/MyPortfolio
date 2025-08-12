import { getToken } from 'next-auth/jwt';
import dbConnect from '../../../lib/mongoose';
import Article from '../../../models/Article';
import { createAuditLog } from '../../../lib/auditLog';
// import { apiRateLimiter, applyRateLimiter } from '../../../lib/rate-limiter';
import { validate } from '../../../lib/validation/validator';
import { updateArticleSchema } from '../../../lib/validation/schemas';

async function handler(req, res) {
  const { slug } = req.query;
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const article = await Article.findOneAndUpdate(
        { slug, published: true },
        { $inc: { views: 1 } },
        { new: true }
      ).populate('author', 'name');

      if (!article) {
        return res.status(404).json({ error: 'Article not found or not published' });
      }
      return res.status(200).json(article);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch article', details: error.message });
    }
  }

  if (req.method === 'PUT') {
    if (!session || !['admin', 'editor'].includes(session.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const updatedArticle = await Article.findOneAndUpdate({ slug }, req.body, { new: true, runValidators: true });
      if (!updatedArticle) {
        return res.status(404).json({ error: 'Article not found' });
      }

      await createAuditLog({
        session,
        action: 'update',
        entity: 'Article',
        entityId: updatedArticle._id.toString(),
        details: `Article updated: ${updatedArticle.title}`,
      });

      return res.status(200).json(updatedArticle);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update article', details: error.message });
    }
  }

  if (req.method === 'DELETE') {
    if (!session || !['admin', 'editor'].includes(session.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const deletedArticle = await Article.findOneAndDelete({ slug });
      if (!deletedArticle) {
        return res.status(404).json({ error: 'Article not found' });
      }

      await createAuditLog({
        session,
        action: 'delete',
        entity: 'Article',
        entityId: deletedArticle._id.toString(),
        details: `Article deleted: ${deletedArticle.title}`,
      });

      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete article', details: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}

const validatedHandler = validate(updateArticleSchema)(handler);

export default validatedHandler;
