import mongoose from "mongoose";

const SavedSearchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Search name is required."],
      trim: true,
    },
    query: {
      type: String,
      required: [true, "Search query is required."],
    },
    scope: {
      type: String,
      required: true,
      enum: ["articles", "projects", "media"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.SavedSearch ||
  mongoose.model("SavedSearch", SavedSearchSchema);
