import mongoose from "mongoose";
import { connectDB } from "@/lib/connectDB";
import UserModel from "@/models/userSchema";

export async function findCandidateManagedLeader(candidateUserId, leaderId) {
  await connectDB();

  if (!mongoose.isValidObjectId(leaderId)) {
    return null;
  }

  return UserModel.findOne({
    _id: leaderId,
    role: "Leader",
    parentId: candidateUserId,
  });
}

export async function markLeaderRegistrationUnpaid(leaderId) {
  await connectDB();

  return UserModel.findByIdAndUpdate(
    leaderId,
    {
      $set: {
        registrationFeePaid: false,
        registrationPaymentStatus: "unpaid",
        paymentStatus: "unpaid",
        isLocked: true,
        LockReason: "Registration fee unpaid.",
      },
    },
    { new: true }
  ).lean();
}

export async function setLeaderRegistrationOrder(leaderId, orderId, amount) {
  await connectDB();

  return UserModel.findByIdAndUpdate(
    leaderId,
    {
      $set: {
        registrationPaymentStatus: "pending",
        paymentStatus: "pending",
        registrationPaymentOrderId: orderId,
        registrationPaymentAmount: amount,
        registrationFeePaid: false,
        isLocked: true,
        LockReason: "Registration payment pending.",
      },
    },
    { new: true }
  ).lean();
}

export async function markLeaderRegistrationPaid(leaderId, { orderId, paymentId, signature, amount }) {
  await connectDB();

  return UserModel.findByIdAndUpdate(
    leaderId,
    {
      $set: {
        registrationFeePaid: true,
        registrationPaymentStatus: "paid",
        paymentStatus: "paid",
        registrationPaymentOrderId: orderId,
        registrationPaymentId: paymentId,
        registrationPaymentSignature: signature,
        registrationPaymentAmount: amount,
        registrationPaymentPaidAt: new Date(),
        isLocked: false,
        LockReason: null,
      },
    },
    { new: true }
  ).lean();
}
