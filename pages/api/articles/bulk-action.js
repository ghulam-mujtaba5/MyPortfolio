// pages/api/articles/bulk-action.js
import { getToken } from 'next-auth/jwt';
import dbConnect from '../../../lib/mongoose';
import Article from '../../../models/Article';
import { createAuditLog } from '../../../lib/auditLog';
// import { apiRateLimiter, applyRateLimiter } from '../../../lib/rate-limiter';
import { validate } from '../../../lib/validation/validator';
import { articleBulkActionSchema } from '../../../lib/validation/schemas';

async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !['admin', 'editor'].includes(token.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  if (req.method === 'POST') {
    await dbConnect();
    const { articleIds, action } = req.body;

    try {
      let result;
      let auditAction;

      switch (action) {
        case 'publish':
          result = await Article.updateMany({ _id: { $in: articleIds } }, { $set: { published: true } });
          auditAction = 'bulk-publish';
          break;
        case 'draft':
          result = await Article.updateMany({ _id: { $in: articleIds } }, { $set: { published: false } });
          auditAction = 'bulk-draft';
          break;
        case 'delete':
          result = await Article.deleteMany({ _id: { $in: articleIds } });
          auditAction = 'bulk-delete';
          break;
        default:
          // This case should not be reachable due to validation, but it's good practice
          return res.status(400).json({ success: false, message: 'Invalid action' });
      }

      // Create a single audit log for the bulk action
      await createAuditLog({
        session: token,
        action: auditAction,
        entity: 'Article',
        entityId: 'multiple',
        details: `${result.deletedCount || result.modifiedCount} articles affected`,
      });

      res.status(200).json({ success: true, message: `Successfully performed ${action} on ${result.deletedCount || result.modifiedCount} articles.` });
    } catch (error) {
      console.error(`Failed to perform bulk action '${action}' on articles:`, error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

const validatedHandler = validate(articleBulkActionSchema)(handler);

export default validatedHandler;
