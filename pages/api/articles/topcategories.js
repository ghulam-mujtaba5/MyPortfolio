import dbConnect from "../../../lib/mongoose";
import Article from "../../../models/Article";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  try {
    await dbConnect();

    const topCategories = await Article.aggregate([
      { $unwind: "$categories" },
      { $group: { _id: "$categories", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
      { $project: { _id: 0, category: "$_id" } },
    ]);

    res
      .status(200)
      .json({ success: true, data: topCategories.map((c) => c.category) });
  } catch (err) {
    console.error("Top categories API error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}
