import dbConnect from "../../../lib/mongoose";
import Article from "../../../models/Article";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
  try {
    await dbConnect();
    const { slug = "", title = "", excludeId = "" } = req.query;
    const filter = {};
    if (slug) filter.slug = slug;
    if (!slug && title) filter.title = title;
    if (excludeId) filter._id = { $ne: excludeId };
    if (!filter.slug && !filter.title) {
      return res.status(400).json({ error: "Provide slug or title" });
    }
    const exists = await Article.exists(filter);
    return res.status(200).json({ duplicate: !!exists });
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Failed to check duplicate", details: e.message });
  }
}
