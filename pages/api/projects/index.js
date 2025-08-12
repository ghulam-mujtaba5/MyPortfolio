import { getToken } from 'next-auth/jwt';
import dbConnect from '../../../lib/mongoose';
import Project from '../../../models/Project';
import { createAuditLog } from '../../../lib/auditLog';
// import { apiRateLimiter, applyRateLimiter } from '../../../lib/rate-limiter';
import { validate } from '../../../lib/validation/validator';
import { createProjectSchema } from '../../../lib/validation/schemas';

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-');

async function handler(req, res) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const { published, featured, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', search = '' } = req.query;

        const query = {};
        if (published === 'true') query.published = true;
        if (published === 'false') query.published = false;
        if (featured === 'true') query.featuredOnHome = true;
        if (search) query.title = { $regex: search, $options: 'i' };

        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        const projects = await Project.find(query)
          .sort(sort)
          .limit(parseInt(limit, 10));
        res.status(200).json({ success: true, data: projects });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    case 'POST':
      if (!session || !['admin', 'editor'].includes(session.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      try {
        // req.body is already validated
        const slug = slugify(req.body.title);
        const project = await Project.create({ ...req.body, slug, author: session.id });

        await createAuditLog({
          session,
          action: 'create',
          entity: 'Project',
          entityId: project._id.toString(),
          details: `Project created: ${project.title || project.name || project.slug}`,
        });

        res.status(201).json({ success: true, data: project });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
}

const validatedHandler = validate(createProjectSchema)(handler);

export default validatedHandler;
