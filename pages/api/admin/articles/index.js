import { getToken } from "next-auth/jwt";
import dbConnect from "../../../../lib/mongoose";
import Article from "../../../../models/Article";

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

  try {
    await dbConnect();
    const {
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      sortOrder = "desc",
      search = "",
      status = "",
      tag = "",
      category = "",
      hasCover = "",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const filter = {};
    if (status === "published") {
      filter.published = true;
      filter.$or = [{ publishAt: null }, { publishAt: { $lte: new Date() } }];
    }
    if (status === "scheduled") {
      filter.published = true;
      filter.publishAt = { $gt: new Date() };
    }
    if (status === "draft") filter.published = false;
    if (search) {
      filter.title = { $regex: new RegExp(search, "i") };
    }
    if (tag) {
      const tags = String(tag)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tags.length > 0) filter.tags = { $in: tags };
    }
    if (category) {
      const categories = String(category)
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      if (categories.length > 0) {
        filter.categories = { $in: categories };
      }
    }
    if (hasCover === "true") {
      filter.coverImage = { $exists: true, $ne: "" };
    } else if (hasCover === "false") {
      filter.$or = [
        { coverImage: { $exists: false } },
        { coverImage: "" },
        { coverImage: null },
      ];
    }

    const sort = {};
    const dir = sortOrder === "asc" ? 1 : -1;
    const allowedSort = new Set(["title", "createdAt", "views"]);
    sort[allowedSort.has(sortBy) ? sortBy : "createdAt"] = dir;

    const articlesQuery = Article.find(filter)
      .select({
        _id: 1,
        title: 1,
        slug: 1,
        createdAt: 1,
        views: 1,
        published: 1,
        publishAt: 1,
        coverImage: 1,
        tags: 1,
        categories: 1,
      })
      .sort(sort)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const totalQuery = Article.countDocuments(filter);

    const topTagsQuery = Article.aggregate([
      { $match: { tags: { $ne: null } } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, tag: "$_id" } },
    ]);

    const topCategoriesQuery = Article.aggregate([
      { $match: { categories: { $ne: null } } },
      { $unwind: "$categories" },
      { $group: { _id: "$categories", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, category: "$_id" } },
    ]);

    const [articles, total, topTagsResult, topCategoriesResult] =
      await Promise.all([
        articlesQuery,
        totalQuery,
        topTagsQuery,
        topCategoriesQuery,
      ]);

    const articlesWithStatus = articles.map((article) => {
      let status = "draft";
      if (article.published) {
        if (article.publishAt && new Date(article.publishAt) > new Date()) {
          status = "scheduled";
        } else {
          status = "published";
        }
      }
      return { ...article, status };
    });

    const topTags = topTagsResult.map((t) => t.tag);
    const topCategories = topCategoriesResult.map((c) => c.category);

    return res.status(200).json({
      success: true,
      articles: articlesWithStatus,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        hasPrevPage: pageNum > 1,
        hasNextPage: pageNum * pageSize < total,
      },
      topTags,
      topCategories,
    });
  } catch (err) {
    console.error("Admin articles index error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}
