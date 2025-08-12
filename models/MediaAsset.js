import mongoose from 'mongoose';

const MediaAssetSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Filename is required.'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'Asset URL is required.'],
  },
  altText: {
    type: String,
    default: '',
    trim: true,
  },
  fileType: {
    type: String,
    required: [true, 'File type is required.'],
  },
  size: {
    type: Number, // size in bytes
    required: [true, 'File size is required.'],
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.MediaAsset || mongoose.model('MediaAsset', MediaAssetSchema);
