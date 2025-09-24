import { getToken } from "next-auth/jwt";
import dbConnect from "../../../lib/mongoose";
import SavedSearch from "../../../models/SavedSearch";
import User from "../../../models/User";

const handler = async (req, res) => {
  const { method } = req;
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !["admin", "editor"].includes(token.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
  } catch (e) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    await dbConnect();
  } catch (dbError) {
    console.error("Database connection error:", dbError);
    return res.status(500).json({ 
      success: false, 
      message: "Database connection failed. Please check server logs.",
      error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
    });
  }

  // Default to configured ADMIN_EMAIL user; fallback to token.id if available
  let userId;
  try {
    const adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
    userId = adminUser?._id;
  } catch {}
  if (!userId) {
    try {
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });
      // next-auth jwt typically has sub as user id
      userId = token?.id || token?.sub || null;
    } catch {}
  }
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "Unable to resolve user for saved searches",
    });
  }

  switch (method) {
    case "GET":
      try {
        const { scope } = req.query;
        if (!scope) {
          return res
            .status(400)
            .json({ success: false, message: "Scope is required" });
        }
        const searches = await SavedSearch.find({ userId, scope }).sort({
          name: 1,
        });
        return res.status(200).json({ success: true, data: searches });
      } catch (error) {
        console.error("Error fetching saved searches:", error);
        return res
          .status(500)
          .json({ 
            success: false, 
            message: "Failed to fetch saved searches",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
      }
      break;

    case "POST":
      try {
        const search = await SavedSearch.create({ ...req.body, userId });
        return res.status(201).json({ success: true, data: search });
      } catch (error) {
        console.error("Error saving search:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to save search",
          errors: error?.errors || null,
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.query;
        const deletedSearch = await SavedSearch.findOneAndDelete({
          _id: id,
          userId,
        });
        if (!deletedSearch) {
          return res
            .status(404)
            .json({ success: false, message: "Saved search not found" });
        }
        return res.status(200).json({ success: true, data: {} });
      } catch (error) {
        console.error("Error deleting saved search:", error);
        return res
          .status(500)
          .json({ 
            success: false, 
            message: "Failed to delete saved search",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      return res
        .status(405)
        .json({ success: false, message: `Method ${method} Not Allowed` });
  }
};

export default handler;