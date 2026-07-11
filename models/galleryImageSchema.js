import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    imagePublicId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

galleryImageSchema.index({ createdAt: -1 });

const GalleryImageModel =
  mongoose.models.GalleryImage ||
  mongoose.model("GalleryImage", galleryImageSchema);

export default GalleryImageModel;
