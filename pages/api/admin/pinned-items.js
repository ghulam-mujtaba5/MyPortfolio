import { getToken } from "next-auth/jwt";
import dbConnect from "../../../lib/mongoose";
import Article from "../../../models/Article";
import Project from "../../../models/Project";

async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !["admin", "editor"].includes(token.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  await dbConnect();

  try {
    const pinnedArticles = await Article.find({ pinned: true })
      .sort({ updatedAt: -1 })
      .limit(5);
    const pinnedProjects = await Project.find({ pinned: true })
      .sort({ updatedAt: -1 })
      .limit(5);

    const items = [
      ...pinnedArticles.map((a) => ({ ...a.toObject(), type: "article" })),
      ...pinnedProjects.map((p) => ({ ...p.toObject(), type: "project" })),
    ];

    // Sort combined items by when they were last updated (most recent first)
    items.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.status(200).json({ success: true, data: items.slice(0, 10) }); // Limit to 10 total
  } catch (error) {
    console.error("Error fetching pinned items:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

export default handler;
