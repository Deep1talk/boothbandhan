import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    targetAudience: {
      type: [String],
      required: true,
      enum: ["Candidate", "Leader"],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "Select at least one target audience",
      },
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true,
    },
    district: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
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

notificationSchema.index({
  status: 1,
  targetAudience: 1,
  district: 1,
  createdAt: -1,
});

const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default NotificationModel;
