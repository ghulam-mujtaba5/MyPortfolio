import { getToken } from "next-auth/jwt";
import dbConnect from "../../lib/mongoose";
import Project from "../../models/Project";
import Article from "../../models/Article";

export default async function handler(req, res) {
  const { secret, type, id } = req.query;

  // 1. Check for secret and id
  if (secret !== process.env.PREVIEW_SECRET || !id) {
    return res.status(401).json({ message: "Invalid token" });
  }

  // 2. Check if the user is authenticated
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !["admin", "editor"].includes(token.role)) {
    return res.status(401).json({ message: "Not authorized" });
  }

  await dbConnect();

  // 3. Fetch the content based on type and id
  let content;
  let path;

  if (type === "project") {
    content = await Project.findById(id).lean();
    path = `/projects/${content.slug}`;
  } else if (type === "article") {
    content = await Article.findById(id).lean();
    path = `/articles/${content.slug}`;
  } else {
    return res.status(400).json({ message: "Invalid content type" });
  }

  if (!content) {
    return res.status(404).json({ message: "Content not found" });
  }

  // 4. Enable Preview Mode by setting the cookies
  // 4. Enable Preview Mode by setting the cookies. Pass the ID to fetch the correct draft.
  res.setPreviewData({ id });

  // 5. Redirect to the path from the fetched content
  res.writeHead(307, { Location: path });
  res.end();
}
