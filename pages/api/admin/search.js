import { getToken } from "next-auth/jwt";
import dbConnect from "../../../lib/mongoose";
import Article from "../../../models/Article";
import Project from "../../../models/Project";
import User from "../../../models/User";

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !["admin", "editor"].includes(token.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const { q = "", limit = 10, type = "all" } = req.query;
  const query = String(q).trim();
  if (!query)
    return res
      .status(400)
      .json({ success: false, message: "Search query is required" });

  try {
    await dbConnect();
    const regex = new RegExp(query, "i");
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const results = [];

    // Search Articles
    if (type === "all" || type === "articles") {
      const articles = await Article.find({
        $or: [{ title: regex }, { tags: regex }, { categories: regex }, { excerpt: regex }],
      })
        .select({
          _id: 1,
          title: 1,
          slug: 1,
          published: 1,
          publishAt: 1,
          createdAt: 1,
          tags: 1,
        })
        .limit(limitNum)
        .lean();

      articles.forEach(article => {
        results.push({
          ...article,
          type: "Article",
        });
      });
    }

    // Search Projects
    if (type === "all" || type === "projects") {
      const projects = await Project.find({
        $or: [{ title: regex }, { tags: regex }, { category: regex }, { description: regex }],
      })
        .select({
          _id: 1,
          title: 1,
          slug: 1,
          published: 1,
          createdAt: 1,
          category: 1,
        })
        .limit(limitNum)
        .lean();

      projects.forEach(project => {
        results.push({
          ...project,
          type: "Project",
        });
      });
    }

    // Search Users (admin only)
    if ((type === "all" || type === "users") && token.role === "admin") {
      const users = await User.find({
        $or: [{ name: regex }, { email: regex }],
      })
        .select({
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          createdAt: 1,
        })
        .limit(limitNum)
        .lean();

      users.forEach(user => {
        results.push({
          ...user,
          title: user.name || user.email,
          type: "User",
        });
      });
    }

    // Sort by relevance (title match first) and recency
    results.sort((a, b) => {
      const aTitle = (a.title || "").toLowerCase();
      const bTitle = (b.title || "").toLowerCase();
      const queryLower = query.toLowerCase();
      
      const aStartsWith = aTitle.startsWith(queryLower);
      const bStartsWith = bTitle.startsWith(queryLower);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Sort by date if both match equally
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return res.status(200).json(results.slice(0, limitNum));
  } catch (error) {
    console.error("Admin Search API error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}
