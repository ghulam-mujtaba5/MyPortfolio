import dbConnect from '../../lib/dbConnect';
import Resume from '../../models/Resume';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  await dbConnect();

  try {
    const resume = await Resume.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!resume) {
      return res.status(404).json({ message: 'No active resume found' });
    }
    res.status(200).json({ resume });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resume', error: error.message });
  }
}
