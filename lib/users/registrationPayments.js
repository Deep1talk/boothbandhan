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

export async function findAdminPayableLeader(adminUserId, leaderId) {
  await connectDB();

  if (!mongoose.isValidObjectId(leaderId)) {
    return null;
  }

  const leader = await UserModel.findOne({
    _id: leaderId,
    role: "Leader",
  });

  if (!leader) {
    return null;
  }

  if (!leader.parentId) {
    return leader;
  }

  const parentCandidate = await UserModel.findOne({
    _id: leader.parentId,
    role: "Candidate",
    parentId: adminUserId,
  })
    .select("_id")
    .lean();

  return parentCandidate ? leader : null;
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

export async function markLeaderRegistrationCashPaid(leaderId) {
  await connectDB();
  const cashReference = `cash-${Date.now()}`;

  return UserModel.findByIdAndUpdate(
    leaderId,
    {
      $set: {
        registrationFeePaid: true,
        registrationPaymentStatus: "paid",
        paymentStatus: "paid",
        registrationPaymentOrderId: cashReference,
        registrationPaymentId: cashReference,
        registrationPaymentSignature: cashReference,
        registrationPaymentPaidAt: new Date(),
        isLocked: false,
        LockReason: null,
      },
    },
    { new: true }
  ).lean();
}
