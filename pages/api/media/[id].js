import { getSession } from 'next-auth/react';
import dbConnect from '../../../lib/mongoose';
import MediaAsset from '../../../models/MediaAsset';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session || !['admin', 'editor'].includes(session.user.role)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();
  const { id } = req.query;

  switch (req.method) {
    case 'PUT':
      try {
        const { altText } = req.body;
        const updatedAsset = await MediaAsset.findByIdAndUpdate(
          id,
          { altText },
          { new: true, runValidators: true }
        );
        if (!updatedAsset) {
          return res.status(404).json({ message: 'Asset not found' });
        }
        res.status(200).json({ message: 'Asset updated successfully', asset: updatedAsset });
      } catch (error) {
        res.status(500).json({ message: 'Error updating asset', error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const asset = await MediaAsset.findById(id);
        if (!asset) {
          return res.status(404).json({ message: 'Asset not found' });
        }

        // Derive GridFS file id from stored URL: /api/media/file/<fileId>
        const parts = asset.url.split('/');
        const fileIdStr = parts[parts.length - 1];
        let fileObjectId = null;
        try {
          fileObjectId = new mongoose.Types.ObjectId(fileIdStr);
        } catch (_) {
          // If not a valid ObjectId, continue to delete only the DB record
        }

        if (fileObjectId) {
          const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'media' });
          try {
            await bucket.delete(fileObjectId);
          } catch (gridErr) {
            // If file missing in GridFS, continue with DB deletion
          }
        }

        await MediaAsset.findByIdAndDelete(id);

        res.status(200).json({ message: 'Asset deleted successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error deleting asset', error: error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
