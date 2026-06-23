import mongoose from "mongoose";

const familyMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
    relation: {
      type: String,
      trim: true,
      default: "",
    },
    age: {
      type: Number,
      default: null,
    },
    gender: {
      type: String,
      trim: true,
      default: "",
    },
    mobileNumber: {
      type: String,
      trim: true,
      default: "",
    },
    educationOrOccupation: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const helpDeskProblemSchema = new mongoose.Schema(
  {
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    constituency: {
      type: String,
      trim: true,
      default: "",
    },
    block: {
      type: String,
      trim: true,
      default: "",
    },
    panchayat: {
      type: String,
      trim: true,
      default: "",
    },
    wardNumber: {
      type: String,
      trim: true,
      default: "",
    },
    wardInchargeName: {
      type: String,
      trim: true,
      default: "",
    },
    wardInchargePhone: {
      type: String,
      trim: true,
      default: "",
    },
    headOfFamilyName: {
      type: String,
      trim: true,
      required: true,
    },
    fatherOrSpouseName: {
      type: String,
      trim: true,
      default: "",
    },
    age: {
      type: Number,
      default: null,
    },
    gender: {
      type: String,
      trim: true,
      default: "",
    },
    casteCategory: {
      type: String,
      trim: true,
      default: "",
    },
    mobileNumber: {
      type: String,
      trim: true,
      required: true,
    },
    whatsappNumber: {
      type: String,
      trim: true,
      default: "",
    },
    localAddress: {
      type: String,
      trim: true,
      default: "",
    },
    totalFamilyMembers: {
      type: Number,
      default: null,
    },
    familyMembers: {
      type: [familyMemberSchema],
      default: [],
    },
    issueCategories: {
      type: [String],
      default: [],
    },
    issueDetails: {
      type: String,
      trim: true,
      required: true,
    },
    verifierComment: {
      type: String,
      trim: true,
      default: "",
    },
    wantsToJoinOrganization: {
      type: Boolean,
      default: null,
    },
    status: {
      type: String,
      enum: ["new", "in_review", "resolved"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

const HelpDeskProblemModel =
  mongoose.models.HelpDeskProblem ||
  mongoose.model("HelpDeskProblem", helpDeskProblemSchema);

export default HelpDeskProblemModel;
