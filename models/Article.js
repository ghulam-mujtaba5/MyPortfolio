import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
  views: {
    type: Number,
    default: 0,
  },
  coverImage: {
    type: String,
  },
  title: {
    type: String,
    required: [true, 'Title is required.'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Slug is required.'],
    unique: true,
    trim: true,
  },
  excerpt: {
    type: String,
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Please provide the content.'],
  },
  tags: {
    type: [String],
    default: [],
  },
  published: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);
