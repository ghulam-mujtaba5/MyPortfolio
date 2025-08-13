// pages/api/admin/articles/preview/[slug].js
import { getToken } from "next-auth/jwt";
import dbConnect from "../../../../../lib/mongoose";
import Article from "../../../../../models/Article";

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
    const { slug } = req.query;
    const article = await Article.findOne({ slug }).lean();
    if (!article)
      return res.status(404).json({ success: false, message: "Not found" });

    return res.status(200).json({ success: true, data: article });
  } catch (e) {
    console.error("Admin preview API error", e);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}
