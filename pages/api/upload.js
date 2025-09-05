import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const { file } = req.body;
    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const uploadResponse = await cloudinary.uploader.upload(file, {
      upload_preset: "portfolio_uploads", // Optional: configure an upload preset in Cloudinary
    });

    res.status(200).json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.error("Upload API error:", error);
    res
      .status(500)
      .json({ message: "Image upload failed", error: error.message });
  }
}
