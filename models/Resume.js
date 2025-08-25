import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  // GridFS file id
  fileId: { type: mongoose.Schema.Types.ObjectId, index: true },
  contentType: { type: String },
  size: { type: Number },
  // Legacy cloud fields (optional for backward compatibility)
  public_id: { type: String },
  url: { type: String },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

// In dev with Next.js, the model can be cached with an old schema.
// Delete it before redefining to ensure latest schema is applied.
if (mongoose.models.Resume) {
  delete mongoose.models.Resume;
}

export default mongoose.model('Resume', ResumeSchema);
