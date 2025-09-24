// pages/api/admin/stats.js
import { getToken } from "next-auth/jwt";
import dbConnect from "../../../lib/mongoose";
import Project from "../../../models/Project";
import Article from "../../../models/Article";
import User from "../../../models/User";
import AuditLog from "../../../models/AuditLog";
import DailyStat from "../../../models/DailyStat";

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !["admin", "editor"].includes(token.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  if (req.method === "GET") {
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

    try {
      const { startDate, endDate } = req.query;

      // Build the date filter for queries
      const dateFilter = {};
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999); // Set to end of the day
        dateFilter.$lte = endOfDay;
      }

      // Determine which queries need the date filter
      const auditLogQuery = AuditLog.find(
        Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}
      )
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name");

      let dailyStatQuery;
      if (Object.keys(dateFilter).length > 0) {
        dailyStatQuery = DailyStat.find({ date: dateFilter })
          .sort({ date: "asc" })
          .lean();
      } else {
        // Default to last 30 days if no range is provided
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dailyStatQuery = DailyStat.find({ date: { $gte: thirtyDaysAgo } })
          .sort({ date: "asc" })
          .lean();
      }

      // Add error handling for the aggregation
      let totalViews = 0;
      try {
        const totalViewsAggregation = await DailyStat.aggregate([
          {
            $match:
              Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {},
          },
          { $group: { _id: null, total: { $sum: "$views" } } },
        ]);
        totalViews =
          totalViewsAggregation.length > 0 ? totalViewsAggregation[0].total : 0;
      } catch (aggregationError) {
        console.error("Error in views aggregation:", aggregationError);
        // Continue with default value of 0
      }

      // These counts are global and not affected by date range
      let projectCount = 0;
      let articleCount = 0;
      let userCount = 0;
      let recentActivity = [];
      let viewStats = [];

      try {
        [projectCount, articleCount, userCount, recentActivity, viewStats] =
          await Promise.all([
            Project.countDocuments().catch(err => {
              console.error("Error counting projects:", err);
              return 0;
            }),
            Article.countDocuments().catch(err => {
              console.error("Error counting articles:", err);
              return 0;
            }),
            User.countDocuments().catch(err => {
              console.error("Error counting users:", err);
              return 0;
            }),
            auditLogQuery.catch(err => {
              console.error("Error fetching recent activity:", err);
              return [];
            }),
            dailyStatQuery.catch(err => {
              console.error("Error fetching view stats:", err);
              return [];
            }),
          ]);
      } catch (promiseError) {
        console.error("Error in Promise.all:", promiseError);
        // Return default values
      }

      res.status(200).json({
        success: true,
        data: {
          stats: {
            projects: projectCount,
            articles: articleCount,
            users: userCount,
            views: totalViews,
          },
          recentActivity,
          viewStats,
        },
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ 
        success: false, 
        message: "Server Error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}