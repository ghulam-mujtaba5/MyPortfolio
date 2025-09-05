import { getToken } from "next-auth/jwt";
import dbConnect from "../../../lib/mongoose";
import AuditLog from "../../../models/AuditLog";

export default async function handler(req, res) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!session || session.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }

  await dbConnect();

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const {
      page = "1",
      limit = "20",
      action = "",
      entity = "",
      userId = "",
      q = "",
      from = "",
      to = "",
      sort = "desc",
    } = req.query;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    const query = {};
    if (action) query.action = action;
    if (entity) query.entity = entity;
    if (userId) query.user = userId;
    if (q)
      query.$or = [
        { userName: { $regex: q, $options: "i" } },
        { details: { $regex: q, $options: "i" } },
        { entityId: { $regex: q, $options: "i" } },
      ];
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const sortObj = { createdAt: sort === "asc" ? 1 : -1 };

    const [items, total] = await Promise.all([
      AuditLog.find(query).sort(sortObj).skip(skip).limit(parsedLimit).lean(),
      AuditLog.countDocuments(query),
    ]);

    return res.status(200).json({
      items: items.map((i) => ({
        ...i,
        _id: i._id.toString(),
        user: i.user?.toString?.(),
      })),
      total,
      page: parsedPage,
      limit: parsedLimit,
    });
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return res.status(500).json({ error: "Failed to fetch audit logs" });
  }
}
