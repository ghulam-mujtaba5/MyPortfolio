import { getToken } from 'next-auth/jwt';
import dbConnect from '../../../lib/mongoose';
import Project from '../../../models/Project';
import mongoose from 'mongoose';
import { createAuditLog } from '../../../lib/auditLog';
// import { apiRateLimiter, applyRateLimiter } from '../../../lib/rate-limiter';
import { validate } from '../../../lib/validation/validator';
import { updateProjectSchema } from '../../../lib/validation/schemas';

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-');

async function handler(req, res) {
  const { id } = req.query; // may be an ObjectId or a slug

  await dbConnect();

  switch (req.method) {
    case 'GET': {
      try {
        let project;
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        if (isObjectId) {
          project = await Project.findById(id).lean();
        } else {
          project = await Project.findOneAndUpdate(
            { slug: id, status: 'Published' },
            { $inc: { views: 1 } },
            { returnDocument: 'after' }
          ).lean();
        }
        if (!project) {
          return res.status(404).json({ success: false, message: 'Project not found' });
        }
        return res.status(200).json({ success: true, data: project });
      } catch (error) {
        console.error('Error fetching project:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch project' });
      }
    }
    case 'PUT':
    case 'DELETE': {
      const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (!session || !['admin', 'editor'].includes(session.role)) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      try {
        const isObjectId = mongoose.Types.ObjectId.isValid(id);
        const filter = isObjectId ? { _id: id } : { slug: id };

        if (req.method === 'PUT') {
          if (req.body.title) {
            req.body.slug = slugify(req.body.title);
          }

          const project = await Project.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
          if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
          }

          await createAuditLog({
            session,
            action: 'update',
            entity: 'Project',
            entityId: project._id.toString(),
            details: `Project updated: ${project.title || project.name || project.slug}`,
          });

          return res.status(200).json({ success: true, data: project });
        } else {
          const project = await Project.findOneAndDelete(filter);
          if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
          }

          await createAuditLog({
            session,
            action: 'delete',
            entity: 'Project',
            entityId: project._id.toString(),
            details: `Project deleted: ${project.title || project.name || project.slug}`,
          });

          return res.status(204).end();
        }
      } catch (error) {
        console.error('Error mutating project:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
    }
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

const validatedHandler = validate(updateProjectSchema)(handler);

export default validatedHandler;
