import { errorResponse, successResponse } from "@/lib/helper";
import { getRegistrationPaymentAmount, verifyRazorpaySignature } from "@/lib/razorpay";
import { requireRequestUser } from "@/lib/server/requestUser";
import { findCandidateManagedLeader, markLeaderRegistrationPaid } from "@/lib/users/registrationPayments";
import { toManagedUserPayload } from "@/lib/users/presenters";

export async function POST(req, { params }) {
  try {
    const auth = await requireRequestUser(req, ["Candidate"]);

    if (!auth.ok) {
      return auth.response;
    }

    const { userId } = await params;
    const leader = await findCandidateManagedLeader(auth.user.id, userId);

    if (!leader) {
      return errorResponse(404, "Leader not found");
    }

    const body = await req.json();
    const orderId = body?.razorpay_order_id?.trim?.() || "";
    const paymentId = body?.razorpay_payment_id?.trim?.() || "";
    const signature = body?.razorpay_signature?.trim?.() || "";

    if (!orderId || !paymentId || !signature) {
      return errorResponse(400, "Payment confirmation details are required");
    }

    if (!verifyRazorpaySignature({ orderId, paymentId, signature })) {
      return errorResponse(400, "Invalid payment signature");
    }

    const updatedLeader = await markLeaderRegistrationPaid(leader._id.toString(), {
      orderId,
      paymentId,
      signature,
      amount: getRegistrationPaymentAmount(),
    });

    return successResponse(200, "Payment received successfully", {
      user: toManagedUserPayload(updatedLeader),
    });
  } catch (error) {
    return errorResponse(500, error?.message || "Unable to confirm payment");
  }
}
