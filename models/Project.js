import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  views: {
    type: Number,
    default: 0,
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
  description: {
    type: String,
    required: [true, 'Description is required.'],
  },
  image: {
    type: String, // URL to the image from upload or direct link
    default: '',
  },
  showImage: {
    type: Boolean,
    default: true,
  },
  tags: {
    type: [String],
    required: true,
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Archived'],
    default: 'In Progress',
  },
  links: {
    live: String,
    github: String,
  },
  published: {
    type: Boolean,
    default: true,
  },
  featuredOnHome: {
    type: Boolean,
    default: false,
  },
  metaTitle: {
    type: String,
    trim: true,
  },
  metaDescription: {
    type: String,
    trim: true,
  },
  ogImage: {
    type: String, // URL to the Open Graph image
    trim: true,
  },
  scheduledAt: {
    type: Date,
    default: null,
  },
  pinned: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
