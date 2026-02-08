// pages/api/admin/reorder-projects.js
import { getToken } from "next-auth/jwt";
import dbConnect from "../../../lib/mongoose";
import Project from "../../../models/Project";

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !["admin", "editor"].includes(token.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const { orderedIds } = req.body || {};

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "'orderedIds' array is required.",
    });
  }

  try {
    await dbConnect();

    // Bulk-update displayOrder for each project based on its position in the array
    const ops = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { displayOrder: index } },
      },
    }));

    await Project.bulkWrite(ops, { ordered: false });

    return res.status(200).json({ success: true, message: "Project order updated." });
  } catch (error) {
    console.error("Error reordering projects:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
