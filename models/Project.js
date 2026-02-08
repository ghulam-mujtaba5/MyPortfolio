import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    views: {
      type: Number,
      default: 0,
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
    description: {
      type: String,
      required: [true, "Description is required."],
    },
    image: {
      type: String, // URL to the main/cover image from upload or direct link
      default: "",
    },
    gallery: {
      type: [{
        url: { type: String, required: true },
        caption: { type: String, default: "" },
        alt: { type: String, default: "" },
        order: { type: Number, default: 0 }
      }],
      default: [],
    },
    imageFit: {
      type: String,
      enum: ["contain", "cover", "fill", "none", "scale-down"],
      default: undefined,
    },
    showImage: {
      type: Boolean,
      default: true,
    },
    showGallery: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      enum: ["In Progress", "Completed", "Archived"],
      default: "In Progress",
    },
    links: {
      live: String,
      github: String,
    },
    category: {
      type: String,
      enum: [
        "All",
        "Software Development",
        "Web Development",
        "AI",
        "Data Science",
        "UI/UX",
        "Client Projects",
        "Others",
      ],
      default: "Others",
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
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Indexes for faster listings and filters
try {
  ProjectSchema.index({ published: 1, createdAt: -1 }, { name: "ProjectPublishedCreated_idx" });
  ProjectSchema.index({ status: 1, createdAt: -1 }, { name: "ProjectStatusCreated_idx" });
  ProjectSchema.index({ pinned: 1, createdAt: -1 }, { name: "ProjectPinnedCreated_idx" });
  ProjectSchema.index({ displayOrder: 1, createdAt: -1 }, { name: "ProjectDisplayOrder_idx" });
  ProjectSchema.index({ tags: 1 }, { name: "ProjectTags_idx" });
  // Full-text index to support public search
  ProjectSchema.index(
    { title: "text", description: "text", tags: "text" },
    { weights: { title: 5, description: 3, tags: 1 }, name: "ProjectTextIndex" }
  );
} catch (e) {
  // noop for dev hot-reload
}

export default mongoose.models.Project ||
  mongoose.model("Project", ProjectSchema);
