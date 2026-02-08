import { getToken } from "next-auth/jwt";
import dbConnect from "../../../lib/mongoose";
import Project from "../../../models/Project";
import { createAuditLog } from "../../../lib/auditLog";
// import { apiRateLimiter, applyRateLimiter } from '../../../lib/rate-limiter';
import { validate } from "../../../lib/validation/validator";
import { createProjectSchema } from "../../../lib/validation/schemas";

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/--+/g, "-");

async function handler(req, res) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  await dbConnect();

  switch (req.method) {
    case "GET":
      try {
        const {
          published,
          featured,
          limit = 20,
          sortBy = "createdAt",
          sortOrder = "desc",
          search = "",
        } = req.query;

        const query = {};
        if (published === "true") query.published = true;
        if (published === "false") query.published = false;
        if (featured === "true") query.featuredOnHome = true;
        if (search) query.title = { $regex: search, $options: "i" };

        // Whitelist allowed sort fields to prevent injection
        const allowedSortFields = ["createdAt", "updatedAt", "title", "views"];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
        const sort = { [safeSortBy]: sortOrder === "asc" ? 1 : -1 };

        // Clamp limit to prevent abuse
        const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

        const projects = await Project.find(query)
          .sort(sort)
          .limit(safeLimit)
          .lean();

        // Set cache headers for public GET requests (no auth required)
        res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
        res.status(200).json({ success: true, data: projects });
      } catch (error) {
        console.error("Projects GET error:", error?.message || error);
        res.status(500).json({ success: false, message: "Failed to fetch projects" });
      }
      break;

    case "POST":
      if (!session || !["admin", "editor"].includes(session.role)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
      try {
        // req.body is already validated
        const slug = slugify(req.body.title);
        const project = await Project.create({
          ...req.body,
          slug,
          author: session.id,
        });

        await createAuditLog({
          session,
          action: "create",
          entity: "Project",
          entityId: project._id.toString(),
          details: `Project created: ${project.title || project.name || project.slug}`,
        });

        res.status(201).json({ success: true, data: project });
      } catch (error) {
        console.error("Projects POST error:", error?.message || error);
        // Distinguish duplicate slug / validation errors from server errors
        const status = error?.code === 11000 ? 409 : 400;
        const message = error?.code === 11000
          ? "A project with this title/slug already exists"
          : error?.message || "Failed to create project";
        res.status(status).json({ success: false, message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
}

const validatedHandler = validate(createProjectSchema)(handler);

export default validatedHandler;
