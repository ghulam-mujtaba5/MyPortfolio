import axios from 'axios';
import dbConnect from '../../lib/dbConnect';
import { GridFSBucket, ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { filename, url, id } = req.query;

  // Prefer GridFS by id when provided
  if (id) {
    try {
      const mongooseConn = await dbConnect();
      const db = mongooseConn.connection.db;
      const bucket = new GridFSBucket(db, { bucketName: 'resumes' });

      // Validate ObjectId
      const objectId = new ObjectId(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename || 'resume.pdf'}`);

      const downloadStream = bucket.openDownloadStream(objectId);
      downloadStream.on('error', (err) => {
        if (err && err.code === 'ENOENT') {
          return res.status(404).send('File not found');
        }
        console.error('GridFS download error:', err);
        if (!res.headersSent) res.status(500).send('Error downloading file');
      });
      return downloadStream.pipe(res);
    } catch (error) {
      console.error('Error serving GridFS file:', error);
      return res.status(500).send('Error downloading file');
    }
  }

  // Fallback: proxy external URL (legacy)
  if (url) {
    try {
      const response = await axios.get(url, { responseType: 'stream' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename || 'resume.pdf'}`);
      return response.data.pipe(res);
    } catch (error) {
      console.error('Error downloading file:', error);
      return res.status(500).send('Error downloading file');
    }
  }

  return res.status(400).send('Missing id or url parameter');
}
