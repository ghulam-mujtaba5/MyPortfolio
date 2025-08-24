import { getToken } from "next-auth/jwt";
import dbConnect from "../../../lib/mongoose";
import Article from "../../../models/Article";
import Project from "../../../models/Project";

async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !["admin", "editor"].includes(token.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  await dbConnect();

  const { id, type } = req.body;

  if (!id || !type) {
    return res
      .status(400)
      .json({ success: false, message: "Item ID and type are required." });
  }

  try {
    let item;
    const Model = type === "article" ? Article : Project;

    if (!Model) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid item type specified." });
    }

    item = await Model.findById(id);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found." });
    }

    // Toggle the pinned status
    item.pinned = !item.pinned;
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error("Error pinning item:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

export default handler;
