import { getSession } from "next-auth/react";
import dbConnect from "../../../lib/mongoose";
import Snippet from "../../../models/Snippet";

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await dbConnect();
  const userId = session.user.id;

  switch (req.method) {
    case "GET":
      try {
        const snippets = await Snippet.find({ createdBy: userId }).sort({
          name: 1,
        });
        res.status(200).json({ success: true, data: snippets });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    case "POST":
      try {
        const { name, html } = req.body;
        if (!name || !html) {
          return res.status(400).json({
            success: false,
            message: "Name and HTML content are required.",
          });
        }
        const snippet = await Snippet.create({ name, html, createdBy: userId });
        res.status(201).json({ success: true, data: snippet });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    case "DELETE":
      try {
        const { id } = req.query;
        if (!id) {
          return res
            .status(400)
            .json({ success: false, message: "Snippet ID is required." });
        }
        const deletedSnippet = await Snippet.findOneAndDelete({
          _id: id,
          createdBy: userId,
        });
        if (!deletedSnippet) {
          return res.status(404).json({
            success: false,
            message:
              "Snippet not found or you do not have permission to delete it.",
          });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, message: error.message });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
}
