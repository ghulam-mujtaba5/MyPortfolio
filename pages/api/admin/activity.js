import dbConnect from "../../../lib/mongoose";
import { getSession } from "next-auth/react";
import AuditLog from "../../../models/AuditLog";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getSession({ req });
  if (!session || session.user.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await dbConnect();

  try {
    const recentActivity = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(); // Use .lean() for faster, plain JS objects

    res.status(200).json(recentActivity);
  } catch (error) {
    console.error("Activity API error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
