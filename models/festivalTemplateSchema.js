import mongoose from "mongoose";

const festivalTemplateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    backgroundImage: {
      type: String,
      required: true,
      trim: true,
    },
    backgroundImagePublicId: {
      type: String,
      required: true,
      trim: true,
    },
    cardBackgroundColor: {
      type: String,
      trim: true,
      default: "#f6c453",
    },
    contactStripBackgroundColor: {
      type: String,
      trim: true,
      default: "#0b0b0b",
    },
    nameTextColor: {
      type: String,
      trim: true,
      default: "#1f2937",
    },
    taglineTextColor: {
      type: String,
      trim: true,
      default: "#7c2d12",
    },
    contactTextColor: {
      type: String,
      trim: true,
      default: "#1f2937",
    },
    fontFamily: {
      type: String,
      trim: true,
      default: "Assistant",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

festivalTemplateSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

const FestivalTemplateModel =
  mongoose.models.FestivalTemplate ||
  mongoose.model("FestivalTemplate", festivalTemplateSchema);

export default FestivalTemplateModel;
