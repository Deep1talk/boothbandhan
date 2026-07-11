import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ["Admin", "Candidate", "Leader"], // Example roles, adjust as needed
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false // Do not return password by default
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    idNo: {
        type: String,
        trim: true,
        default: ""
    },
    bloodGroup: {
        type: String,
        trim: true,
        default: ""
    },
    fatherName: {
        type: String,
        trim: true,
        default: ""
    },
    age: {
        type: Number,
        default: null
    },
    gender: {
        type: String,
        trim: true,
        default: ""
    },
    casteCategory: {
        type: String,
        trim: true,
        default: ""
    },
    religion: {
        type: String,
        trim: true,
        default: ""
    },
    whatsappNumber: {
        type: String,
        trim: true,
        default: ""
    },
    fullAddress: {
        type: String,
        trim: true,
        default: ""
    },
    ward: {
        type: String,
        trim: true,
        default: ""
    },
    panchayat: {
        type: String,
        trim: true,
        default: ""
    },
    block: {
        type: String,
        trim: true,
        default: ""
    },
    district: {
        type: String,
        trim: true,
        default: ""
    },
    vidhansabha: {
        type: String,
        trim: true,
        default: ""
    },
    currentParty: {
        type: String,
        trim: true,
        default: ""
    },
    politicalPosition: {
        type: String,
        trim: true,
        default: ""
    },
    hasContestedElection: {
        type: String,
        trim: true,
        default: ""
    },
    experienceYears: {
        type: Number,
        default: null
    },
    mainSupportBase: {
        type: String,
        trim: true,
        default: ""
    },
    activeWorkerCount: {
        type: Number,
        default: null
    },
    totalVoters: {
        type: Number,
        default: null
    },
    hasTenHouseWorkers: {
        type: String,
        trim: true,
        default: ""
    },
    digitalCampaign: {
        type: String,
        trim: true,
        default: ""
    },
    financialPreparedness: {
        type: String,
        trim: true,
        default: ""
    },
    topIssues: {
        type: [String],
        default: []
    },
    registrationFeePaid: {
        type: Boolean,
        default: false
    },
    registrationPaymentStatus: {
        type: String,
        enum: ["pending", "unpaid", "paid"],
        default: "pending"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "unpaid", "paid"],
        default: "pending"
    },
    registrationPaymentAmount: {
        type: Number,
        default: 0
    },
    registrationPaymentOrderId: {
        type: String,
        trim: true,
        default: ""
    },
    registrationPaymentId: {
        type: String,
        trim: true,
        default: ""
    },
    registrationPaymentSignature: {
        type: String,
        trim: true,
        default: ""
    },
    registrationPaymentPaidAt: {
        type: Date,
        default: null
    },
    declarationAccepted: {
        type: Boolean,
        default: false
    },
    registrationDate: {
        type: String,
        trim: true,
        default: ""
    },
    registrationPlace: {
        type: String,
        trim: true,
        default: ""
    },
    signatureName: {
        type: String,
        trim: true,
        default: ""
    },
    avatar: {
        type: String,
        trim: true,
        default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y" // Default avatar URL
    },
    avatarPublicId: {
        type: String,
        trim: true,
        default: null
    },
    greetingTagline: {
        type: String,
        trim: true,
        default: ""
    },
    instagramHandle: {
        type: String,
        trim: true,
        default: ""
    },
    twitterHandle: {
        type: String,
        trim: true,
        default: ""
    },
    facebookHandle: {
        type: String,
        trim: true,
        default: ""
    },
    posterPhoto: {
        type: String,
        trim: true,
        default: ""
    },
    posterPhotoPublicId: {
        type: String,
        trim: true,
        default: null
    },
    posterPhotoScale: {
        type: Number,
        default: 1
    },
    posterPhotoOffsetX: {
        type: Number,
        default: 0
    },
    posterPhotoOffsetY: {
        type: Number,
        default: 0
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true // Add index for efficient querying of non-deleted candidates
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    LockReason: {
        type: String,
        trim: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to parent user (e.g., for candidates under a leader)
        ref: "User", // Reference to the User model
        default: null
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
})

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);
}); // Hash password before saving

userSchema.methods = {
    comparePassword: async function (fPassword) {
        return await bcrypt.compare(fPassword, this.password);
    }
} // Method to compare password for login



const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export default UserModel;
