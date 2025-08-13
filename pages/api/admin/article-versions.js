import dbConnect from "../../../lib/mongoose";
import ArticleVersion from "../../../models/ArticleVersion";
import withAdminAuth from "../../../lib/withAdminAuth";

const handler = async (req, res) => {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const { articleId } = req.query;
        if (!articleId) {
          return res
            .status(400)
            .json({ success: false, message: "Article ID is required" });
        }
        const versions = await ArticleVersion.find({ articleId })
          .sort({ createdAt: -1 })
          .limit(20);
        res.status(200).json({ success: true, data: versions });
      } catch (error) {
        res
          .status(400)
          .json({ success: false, message: "Failed to fetch versions" });
      }
      break;

    case "POST":
      try {
        // Here, you might want to add logic to prevent saving too many versions
        // or saving a new version if the content hasn't changed significantly.
        const version = await ArticleVersion.create(req.body);
        res.status(201).json({ success: true, data: version });
      } catch (error) {
        res.status(400).json({
          success: false,
          message: "Failed to save version",
          errors: error.errors,
        });
      }
      break;

    case "DELETE":
      try {
        const { versionId } = req.query;
        if (!versionId) {
          return res
            .status(400)
            .json({ success: false, message: "Version ID is required" });
        }
        await ArticleVersion.findByIdAndDelete(versionId);
        res.status(200).json({ success: true, message: "Version deleted" });
      } catch (error) {
        res
          .status(400)
          .json({ success: false, message: "Failed to delete version" });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default withAdminAuth(handler);
