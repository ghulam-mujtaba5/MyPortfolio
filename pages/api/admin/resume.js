import formidable from 'formidable';
import { getToken } from 'next-auth/jwt';
import Resume from '../../../models/Resume';
import dbConnect from '../../../lib/dbConnect';
import { GridFSBucket } from 'mongodb';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !['admin', 'editor'].includes(token.role)) {
    return res.status(403).json({ message: 'Forbidden' });
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
    // Formidable v3: call formidable() directly (no new IncomingForm)
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      maxFileSize: 20 * 1024 * 1024, // 20 MB
      filter: ({ mimetype, originalFilename }) => {
        return (
          mimetype === 'application/pdf' || /\.pdf$/i.test(originalFilename || '')
        );
      },
    });
    await new Promise((resolve) => {
      form.parse(req, async (err, fields, files) => {
        try {
          if (err) {
            console.error('Formidable parse error (resume):', err);
            res.status(500).json({ message: 'Error parsing form data', error: err.message });
            return resolve();
          }

          // In v3, a field may be a single File or an array
          let file = files.resume;
          if (Array.isArray(file)) file = file[0];

          if (!file) {
            res.status(400).json({ message: 'No file uploaded' });
            return resolve();
          }

          // Enforce PDF content-type/extension
          const isPdf = (file.mimetype === 'application/pdf') || /\.pdf$/i.test(file.originalFilename || '');
          if (!isPdf) {
            res.status(400).json({ message: 'Only PDF files are allowed' });
            return resolve();
          }

          // Upload to MongoDB GridFS
          const mongooseConn = await dbConnect();
          const db = mongooseConn.connection.db;
          const bucket = new GridFSBucket(db, { bucketName: 'resumes' });

          const uploadStream = bucket.openUploadStream(file.originalFilename, {
            contentType: file.mimetype || 'application/pdf',
          });

          await new Promise((resUpload, rejUpload) => {
            fs.createReadStream(file.filepath)
              .pipe(uploadStream)
              .on('error', rejUpload)
              .on('finish', resUpload);
          });

          const fileId = uploadStream.id; // ObjectId

          await Resume.updateMany({}, { $set: { isActive: false } });

          const newResume = new Resume({
            filename: file.originalFilename,
            fileId,
            contentType: file.mimetype || 'application/pdf',
            size: typeof file.size === 'number' ? file.size : undefined,
            isActive: true,
          });

          await newResume.save();

          res.status(201).json({ message: 'Resume uploaded successfully', resume: newResume });
          return resolve();
        } catch (error) {
          console.error('Resume upload error (GridFS):', error);
          res.status(500).json({ message: 'Error uploading resume', error: error.message });
          return resolve();
        }
      });
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
