import { getToken } from 'next-auth/jwt';
import dbConnect from '../../../lib/mongoose';
import Article from '../../../models/Article';
import { createAuditLog } from '../../../lib/auditLog';
// import { apiRateLimiter, applyRateLimiter } from '../../../lib/rate-limiter';
import { validate } from '../../../lib/validation/validator';
import { createArticleSchema } from '../../../lib/validation/schemas';

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function handler(req, res) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { limit = '20', skip = '0', q = '' } = req.query;
      const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
      const parsedSkip = parseInt(skip, 10) || 0;
      const query = {
        published: true,
        ...(q
          ? { $or: [
              { title: { $regex: q, $options: 'i' } },
              { excerpt: { $regex: q, $options: 'i' } },
              { tags: { $regex: q, $options: 'i' } },
            ] }
          : {}),
      };
      const articles = await Article.find(query)
        .sort({ createdAt: -1 })
        .skip(parsedSkip)
        .limit(parsedLimit);

      const total = await Article.countDocuments(query);

      return res.status(200).json({ articles, total });
    } catch (e) {
      return res.status(500).json({ error: 'Failed to fetch articles', details: e.message });
    }
  }

  if (req.method === 'POST') {
    if (!session || !['admin', 'editor'].includes(session.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      // req.body is already validated by the middleware
      const { title, content, excerpt, tags, published, coverImage, slug } = req.body;

      const newArticle = new Article({
        title,
        slug: slug || slugify(title),
        content,
        excerpt,
        tags,
        published,
        coverImage,
        author: session.id,
      });

      const savedArticle = await newArticle.save();

      await createAuditLog({
        session,
        action: 'create',
        entity: 'Article',
        entityId: savedArticle._id.toString(),
        details: `Article created: ${savedArticle.title}`,
      });

      return res.status(201).json(savedArticle);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ error: 'An article with this slug already exists.' });
      }
      return res.status(500).json({ error: 'Failed to create article', details: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}

// Wrap the handler with validation and then rate limiting
const validatedHandler = validate(createArticleSchema)(handler);

export default validatedHandler;
