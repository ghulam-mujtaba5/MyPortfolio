import { getToken } from "next-auth/jwt";
import dbConnect from "../../../lib/mongoose";
import Project from "../../../models/Project";
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
    return res.status(400).json({ message: "Project IDs are required" });
  }

  try {
    const result = await Project.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No matching projects found to delete." });
    }
    await createAuditLog({
      session,
      action: "bulk_delete",
      entity: "Project",
      details: `${result.deletedCount} projects deleted`,
    });
    res.status(200).json({
      message: `${result.deletedCount} projects deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting projects:", error);
    res.status(500).json({ message: "Server error while deleting projects" });
  }
}
