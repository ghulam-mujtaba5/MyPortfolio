import { getToken } from "next-auth/jwt";
import dbConnect from "../../../../lib/mongoose";
import Article from "../../../../models/Article";
import mongoose from "mongoose";

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

    let { ids, articleIds } = req.body || {};
    // Support legacy/client key 'articleIds' as well
    ids = ids ?? articleIds;
    // Allow single id as string
    if (typeof ids === "string") ids = [ids];

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "'ids' array is required" });
    }

    // Validate ObjectIds
    const validIds = ids
      .map((id) => (typeof id === "string" ? id.trim() : ""))
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (validIds.length === 0) {
      return res.status(400).json({ success: false, message: "No valid ids provided" });
    }

    const result = await Article.deleteMany({ _id: { $in: validIds } });

    return res.status(200).json({
      success: true,
      deletedCount: result?.deletedCount || 0,
      attempted: ids.length,
    });
  } catch (err) {
    console.error("Admin articles bulk-delete error:", err);
    return res.status(500).json({ success: false, message: "Server Error", details: err.message });
  }
}
