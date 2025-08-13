// pages/api/projects/bulk-action.js
import { getToken } from "next-auth/jwt";
import dbConnect from "../../../lib/mongoose";
import Project from "../../../models/Project";
import { createAuditLog } from "../../../lib/auditLog";
// import { apiRateLimiter, applyRateLimiter } from '../../../lib/rate-limiter';
import { validate } from "../../../lib/validation/validator";
import { bulkActionSchema } from "../../../lib/validation/schemas";

async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !["admin", "editor"].includes(token.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  if (req.method === "POST") {
    await dbConnect();
    const { projectIds, action } = req.body;

    try {
      let result;
      let auditAction;

      switch (action) {
        case "publish":
          result = await Project.updateMany(
            { _id: { $in: projectIds } },
            { $set: { published: true } },
          );
          auditAction = "bulk-publish";
          break;
        case "draft":
          result = await Project.updateMany(
            { _id: { $in: projectIds } },
            { $set: { published: false } },
          );
          auditAction = "bulk-draft";
          break;
        case "delete":
          result = await Project.deleteMany({ _id: { $in: projectIds } });
          auditAction = "bulk-delete";
          break;
        default:
          return res
            .status(400)
            .json({ success: false, message: "Invalid action" });
      }

      // Create a single audit log for the bulk action
      await createAuditLog({
        session: token,
        action: auditAction,
        entity: "Project",
        entityId: "multiple",
        details: `${result.deletedCount || result.modifiedCount} projects affected`,
      });

      res.status(200).json({
        success: true,
        message: `Successfully performed ${action} on ${result.deletedCount || result.modifiedCount} projects.`,
      });
    } catch (error) {
      console.error(
        `Failed to perform bulk action '${action}' on projects:`,
        error,
      );
      res.status(500).json({ success: false, message: "Server Error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

const validatedHandler = validate(bulkActionSchema)(handler);

export default validatedHandler;
