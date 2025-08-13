import mongoose from 'mongoose';

const ArticleVersionSchema = new mongoose.Schema({
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  excerpt: String,
  tags: [String],
  categories: [String],
  highlights: [String],
  savedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true, // Will add this once user auth is fully integrated
  },
}, {
  timestamps: { createdAt: true, updatedAt: false }, // Only care about when it was created
});

export default mongoose.models.ArticleVersion || mongoose.model('ArticleVersion', ArticleVersionSchema);
