// pages/api/track-view.js
import dbConnect from '../../lib/mongoose';
import Article from '../../models/Article';
import Project from '../../models/Project';
import DailyStat from '../../models/DailyStat';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { id, type } = req.body;

  if (!id || !type || !['article', 'project'].includes(type)) {
    return res.status(400).json({ success: false, message: 'Invalid request body' });
  }

  try {
    await dbConnect();

    const Model = type === 'article' ? Article : Project;
    const updatedContent = await Model.findByIdAndUpdate(id, { $inc: { views: 1 } });

    if (!updatedContent) {
      return res.status(404).json({ success: false, message: `${type} not found` });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day

    const updateField = type === 'article' ? 'articleViews' : 'projectViews';

    await DailyStat.findOneAndUpdate(
      { date: today },
      { $inc: { [updateField]: 1 } },
      { upsert: true, new: true } // Create a new doc if one doesn't exist for today
    );

    res.status(200).json({ success: true, message: 'View tracked' });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}
