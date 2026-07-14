import { errorResponse, successResponse } from "@/lib/helper";
import { getRegistrationPaymentAmount, getRazorpayPublicKey, createRazorpayOrder } from "@/lib/razorpay";
import { requireRequestUser } from "@/lib/server/requestUser";
import {
  findAdminPayableLeader,
  findCandidateManagedLeader,
  setLeaderRegistrationOrder,
} from "@/lib/users/registrationPayments";

export async function POST(req, { params }) {
  try {
    const auth = await requireRequestUser(req, ["Admin", "Candidate"]);

    if (!auth.ok) {
      return auth.response;
    }

    const { userId } = await params;
    const leader =
      auth.user.role === "Admin"
        ? await findAdminPayableLeader(auth.user.id, userId)
        : await findCandidateManagedLeader(auth.user.id, userId);

    if (!leader) {
      return errorResponse(404, "Leader not found");
    }

    const amount = getRegistrationPaymentAmount();
    const order = await createRazorpayOrder({
      receipt: `leader-${leader._id.toString()}-${Date.now()}`,
      notes: {
        leaderId: leader._id.toString(),
        actorId: auth.user.id,
        actorRole: auth.user.role,
        type: "leader_registration",
      },
    });

    await setLeaderRegistrationOrder(leader._id.toString(), order.id, amount);

    return successResponse(200, "Payment order created successfully", {
      leaderId: leader._id.toString(),
      amount,
      key: getRazorpayPublicKey(),
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      leader: {
        id: leader._id.toString(),
        name: leader.name,
        email: leader.email,
        phone: leader.phone,
      },
    });
  } catch (error) {
    return errorResponse(500, error?.message || "Unable to create payment order");
  }
}
