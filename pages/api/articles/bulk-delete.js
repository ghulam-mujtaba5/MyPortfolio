import { getToken } from "next-auth/jwt";
import dbConnect from "../../../lib/mongoose";
import Article from "../../../models/Article";
import { createAuditLog } from "../../../lib/auditLog";

export default async function handler(req, res) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!session || session.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await dbConnect();

  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Article IDs are required" });
  }

  try {
    const result = await Article.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No matching articles found to delete." });
    }

    await createAuditLog({
      session,
      action: "bulk_delete",
      entity: "Article",
      details: `${result.deletedCount} articles deleted`,
    });

    res.status(200).json({
      message: `${result.deletedCount} articles deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting articles:", error);
    res.status(500).json({ message: "Server error while deleting articles" });
  }
}
