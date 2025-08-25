import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import { getToken } from 'next-auth/jwt';
import Resume from '../../../models/Resume';
import dbConnect from '../../../lib/dbConnect';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.isAdmin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const resume = await Resume.findOne({ isActive: true }).sort({ createdAt: -1 });
      res.status(200).json({ resume });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching resume', error: error.message });
    }
  } else if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: 'Error parsing form data', error: err.message });
      }

      const file = files.resume;
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      try {
        const result = await cloudinary.uploader.upload(file.filepath, {
          folder: 'resumes',
          resource_type: 'raw',
        });

        await Resume.updateMany({}, { $set: { isActive: false } });

        const newResume = new Resume({
          filename: file.originalFilename,
          public_id: result.public_id,
          url: result.secure_url,
          isActive: true,
        });

        await newResume.save();

        res.status(201).json({ message: 'Resume uploaded successfully', resume: newResume });
      } catch (error) {
        res.status(500).json({ message: 'Error uploading to Cloudinary', error: error.message });
      }
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
