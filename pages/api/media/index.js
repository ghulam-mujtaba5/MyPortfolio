import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from "../../../lib/mongoose";
import MediaAsset from "../../../models/MediaAsset";
import formidable from "formidable";
import fs from "fs";
import mongoose from "mongoose";
import { generateSEOFilename } from "../../../lib/generateSEOFilename";

// Disable Next.js body parser for this route to use formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!["admin", "editor"].includes(session.user?.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    await dbConnect();
  } catch (e) {
    console.error("[media] dbConnect error:", e);
    return res.status(503).json({ message: "Database connection error" });
  }

  switch (req.method) {
    case "GET":
      try {
        console.log("[media][GET] query:", req.query);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";

        const query = search
          ? {
              $or: [
                { filename: { $regex: search, $options: "i" } },
                { tags: { $regex: search, $options: "i" } },
              ],
            }
          : {};

        const assets = await MediaAsset.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("uploadedBy", "name");

        const total = await MediaAsset.countDocuments(query);

        res.status(200).json({ assets, total, page, limit });
      } catch (error) {
        console.error("[media][GET] error:", error);
        res.status(500).json({
          message: "Error fetching media assets",
          error: error.message,
        });
      }
      break;

    case "POST":
      try {
        const form = formidable({});

        form.parse(req, async (err, fields, files) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Error parsing form data", error: err.message });
          }

          const file = files.file?.[0];
          if (!file) {
            return res.status(400).json({ message: "No file uploaded." });
          }

          try {
            if (
              mongoose.connection.readyState !== 1 ||
              !mongoose.connection.db
            ) {
              console.error(
                "[media][POST] Mongo connection not ready:",
                mongoose.connection.readyState,
              );
              return res
                .status(503)
                .json({ message: "Database not ready, please retry" });
            }
            // Store file in MongoDB GridFS
            const conn = mongoose.connection;
            const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
              bucketName: "media",
            });

            const uploadStream = bucket.openUploadStream(
              file.originalFilename,
              {
                contentType: file.mimetype,
              },
            );

            await new Promise((resolve, reject) => {
              fs.createReadStream(file.filepath)
                .on("error", reject)
                .pipe(uploadStream)
                .on("error", reject)
                .on("finish", resolve);
            });

            const fileId = uploadStream.id; // ObjectId of the stored file

            // Clean up the temporary file
            if (fs.existsSync(file.filepath)) {
              fs.unlinkSync(file.filepath);
            }

            // Generate SEO-friendly filename if context provided
            let seoFilename = file.originalFilename;
            const contextTitle = fields.contextTitle?.[0];
            const imageType = fields.imageType?.[0];
            
            if (contextTitle) {
              seoFilename = generateSEOFilename(file.originalFilename, {
                contextTitle,
                imageType: imageType || "image",
              });
            }

            // Create new MediaAsset in DB with API URL to serve the file
            const newAsset = new MediaAsset({
              filename: seoFilename,
              url: `/api/media/file/${fileId.toString()}`,
              altText: fields.altText?.[0] || seoFilename,
              fileType: file.mimetype,
              size: file.size,
              uploadedBy: session.user.id,
            });

            await newAsset.save();

            res
              .status(201)
              .json({ message: "File uploaded successfully", asset: newAsset });
          } catch (uploadError) {
            // If upload fails, still try to clean up temp file
            if (fs.existsSync(file.filepath)) {
              fs.unlinkSync(file.filepath);
            }
            console.error("[media][POST] upload error:", uploadError);
            res.status(500).json({
              message: "Error uploading file",
              error: uploadError.message,
            });
          }
        });
      } catch (error) {
        console.error("[media][POST] parse/init error:", error);
        res.status(500).json({
          message: "Error processing upload request",
          error: error.message,
        });
      }
      break;

    case "DELETE":
      try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return res.status(400).json({ message: "Asset IDs are required" });
        }

        const assets = await MediaAsset.find({ _id: { $in: ids } });
        if (assets.length === 0) {
          return res
            .status(404)
            .json({ message: "No assets found for the given IDs." });
        }

        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
          bucketName: "media",
        });

        for (const asset of assets) {
          const parts = asset.url.split("/");
          const fileIdStr = parts[parts.length - 1];
          try {
            const fileObjectId = new mongoose.Types.ObjectId(fileIdStr);
            await bucket.delete(fileObjectId);
          } catch (e) {
            console.warn(
              `Could not delete file ${fileIdStr} from GridFS for asset ${asset._id}. It might have been already deleted.`,
              e.message,
            );
          }
        }

        await MediaAsset.deleteMany({ _id: { $in: ids } });

        res.status(200).json({ message: "Assets deleted successfully" });
      } catch (error) {
        console.error("[media][DELETE] error:", error);
        res
          .status(500)
          .json({ message: "Error deleting assets", error: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
