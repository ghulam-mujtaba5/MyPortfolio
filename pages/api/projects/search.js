import dbConnect from "../../../lib/mongoose";
import Project from "../../../models/Project";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const { q = "", page = "1", limit = "10" } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * pageSize;

  try {
    await dbConnect();

    const baseFilter = { published: true };
    const filter = q.trim()
      ? { ...baseFilter, $text: { $search: q.trim() } }
      : baseFilter;

    const projection = {
      title: 1,
      slug: 1,
      description: 1,
      tags: 1,
      createdAt: 1,
      ...(q.trim() ? { score: { $meta: "textScore" } } : {}),
    };

    const sort = q.trim()
      ? { score: { $meta: "textScore" }, createdAt: -1 }
      : { createdAt: -1 };

    const [items, total] = await Promise.all([
      Project.find(filter)
        .select(projection)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Project.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        items,
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        q,
      },
    });
  } catch (err) {
    console.error("Project Search API error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}
