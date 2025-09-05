import { getToken } from "next-auth/jwt";
import dbConnect from "../../../lib/mongoose";
import Article from "../../../models/Article";
import Project from "../../../models/Project";

const MAX_FEATURED_ITEMS = 3;

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !["admin", "editor"].includes(token.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id, type, featured } = req.body;

  if (!id || !type || typeof featured !== 'boolean') {
    return res.status(400).json({ success: false, message: "Missing required parameters: id, type, and featured status." });
  }

  const Model = type === 'article' ? Article : Project;
  if (!Model) {
    return res.status(400).json({ success: false, message: "Invalid item type specified." });
  }

  try {
    await dbConnect();

    if (featured) {
      const featuredCount = await Model.countDocuments({ featuredOnHome: true });
      if (featuredCount >= MAX_FEATURED_ITEMS) {
        return res.status(400).json({
          success: false,
          message: `You can only feature a maximum of ${MAX_FEATURED_ITEMS} ${type}s at a time.`
        });
      }
    }

    const updatedItem = await Model.findByIdAndUpdate(
      id,
      { $set: { featuredOnHome: featured } },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    res.status(200).json({ success: true, data: updatedItem });

  } catch (error) {
    console.error(`Failed to update ${type} feature status:`, error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}
