import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    views: {
      type: Number,
      default: 0,
    },
    coverImage: {
      type: String,
    },
    coverImageAlt: {
      type: String,
      trim: true,
    },
    showCoverImage: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required."],
      unique: true,
      trim: true,
    },
    excerpt: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Please provide the content."],
    },
    tags: {
      type: [String],
      default: [],
    },
    categories: {
      type: [String],
      default: [],
    },
    published: {
      type: Boolean,
      default: false,
    },
    publishAt: {
      type: Date,
      default: null,
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
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Text index for public search
// Weights prioritize title and excerpt over body content and tags
if (!ArticleSchema._indexed) {
  try {
    ArticleSchema.index(
      {
        title: "text",
        excerpt: "text",
        content: "text",
        tags: "text",
      },
      {
        weights: { title: 5, excerpt: 3, content: 2, tags: 1 },
        name: "ArticleTextIndex",
      },
    );
    ArticleSchema._indexed = true;
  } catch (e) {
    // noop: index may already exist in dev hot-reload
  }
}

export default mongoose.models.Article ||
  mongoose.model("Article", ArticleSchema);
