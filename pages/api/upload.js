import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import formidable from "formidable";
import fs from "fs";

// Disable Next.js body parsing to handle FormData
export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Parse form data using formidable
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB max file size
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const { fields, files } = await parseForm(req);

    // Get the file - formidable v3 returns files as arrays
    const fileArray = files.file;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // Get the folder from fields if provided
    const folderArray = fields.folder;
    const folder = Array.isArray(folderArray) ? folderArray[0] : folderArray;

    // Upload to Cloudinary
    const uploadOptions = {
      resource_type: "auto",
    };

    // Add folder if specified
    if (folder) {
      uploadOptions.folder = folder;
    }

    // Add upload preset if configured
    if (process.env.CLOUDINARY_UPLOAD_PRESET) {
      uploadOptions.upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;
    }

    const uploadResponse = await cloudinary.uploader.upload(
      file.filepath,
      uploadOptions,
    );

    // Clean up the temporary file
    try {
      fs.unlinkSync(file.filepath);
    } catch (cleanupError) {
      console.warn("Could not clean up temp file:", cleanupError.message);
    }

    res.status(200).json({
      url: uploadResponse.secure_url,
      secure_url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      width: uploadResponse.width,
      height: uploadResponse.height,
      format: uploadResponse.format,
    });
  } catch (error) {
    console.error("Upload API error:", error);
    res.status(500).json({
      message: "Image upload failed",
      error: error.message,
    });
  }
}
