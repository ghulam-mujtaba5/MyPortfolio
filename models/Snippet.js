import mongoose from "mongoose";

const SnippetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Snippet name is required."],
      trim: true,
    },
    html: {
      type: String,
      required: [true, "Snippet HTML content is required."],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Ensure a user doesn't have duplicate snippet names
SnippetSchema.index({ name: 1, createdBy: 1 }, { unique: true });

export default mongoose.models.Snippet ||
  mongoose.model("Snippet", SnippetSchema);
