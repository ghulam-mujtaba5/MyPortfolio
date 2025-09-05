// pages/api/articles/bulk-metadata.js
import { getToken } from "next-auth/jwt";
import dbConnect from "../../../lib/mongoose";
import Article from "../../../models/Article";

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !["admin", "editor"].includes(token.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  try {
    await dbConnect();
    const { articleIds, tagsCsv = "", categoriesCsv = "", op } = req.body;

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "articleIds are required" });
    }
    const tags = String(tagsCsv)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const categories = String(categoriesCsv)
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    let update = null;
    switch (op) {
      case "addTags":
        if (tags.length === 0)
          return res
            .status(400)
            .json({ success: false, message: "No tags provided" });
        update = { $addToSet: { tags: { $each: tags } } };
        break;
      case "removeTags":
        if (tags.length === 0)
          return res
            .status(400)
            .json({ success: false, message: "No tags provided" });
        update = { $pull: { tags: { $in: tags } } };
        break;
      case "addCategories":
        if (categories.length === 0)
          return res
            .status(400)
            .json({ success: false, message: "No categories provided" });
        update = { $addToSet: { categories: { $each: categories } } };
        break;
      case "removeCategories":
        if (categories.length === 0)
          return res
            .status(400)
            .json({ success: false, message: "No categories provided" });
        update = { $pull: { categories: { $in: categories } } };
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid operation" });
    }

    const result = await Article.updateMany(
      { _id: { $in: articleIds } },
      update,
    );
    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} articles updated.`,
    });
  } catch (err) {
    console.error("Bulk metadata API error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}
