import dbConnect from "../../../lib/mongoose";
import Article from "../../../models/Article";
import Project from "../../../models/Project";
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id, type } = req.body;

  if (!id || !type) {
    return res.status(400).json({ message: 'ID and type are required' });
  }

  await dbConnect();

  const Model = type === 'article' ? Article : Project;
  if (!Model) {
    return res.status(400).json({ message: 'Invalid type' });
  }

  let exists = false;
  if (mongoose.isValidObjectId(id)) {
    const item = await Model.findById(id).select('_id').lean();
    if (item) {
        exists = true;
    }
  }
  
  if (!exists) {
      const item = await Model.findOne({ slug: id }).select('_id').lean();
      if (item) {
          exists = true;
      }
  }

  res.status(200).json({ exists });
}
