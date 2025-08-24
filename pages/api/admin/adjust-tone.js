import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Deprecated: This AI endpoint has been removed from the application.
  return res
    .status(410)
    .json({ message: "This endpoint has been removed." });
}
