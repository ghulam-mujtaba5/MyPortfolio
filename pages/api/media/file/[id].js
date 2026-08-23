import dbConnect from "../../../../lib/mongoose";
import mongoose from "mongoose";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { id } = req.query;
  await dbConnect();

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const conn = mongoose.connection;
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: "media",
    });

    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(id);
    } catch (_) {
      return res.status(400).json({ message: "Invalid file id" });
    }

    const files = await conn.db
      .collection("media.files")
      .find({ _id: objectId })
      .toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    const file = files[0];
    const etag = `"${file._id}_${file.length || 0}"`;

    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }

    if (file.contentType) {
      res.setHeader("Content-Type", file.contentType);
    }
    if (file.length) {
      res.setHeader("Content-Length", file.length);
    }
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    const downloadStream = bucket.openDownloadStream(objectId);

    downloadStream.on("error", () => {
      if (!res.headersSent) {
        res.status(404).end();
      }
    });

    downloadStream.pipe(res);
  } catch (err) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Error streaming file", error: err.message });
    }
  }
}
