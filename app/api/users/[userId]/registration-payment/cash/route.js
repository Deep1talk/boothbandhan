import { cashPaymentConfirmationEmail } from "@/email/cashPaymentConfirmationEmail";
import { errorResponse, successResponse } from "@/lib/helper";
import { sendMail } from "@/lib/sendMail";
import { requireRequestUser } from "@/lib/server/requestUser";
import {
  findCandidateManagedLeader,
  markLeaderRegistrationCashPaid,
} from "@/lib/users/registrationPayments";
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

    const updatedLeader = await markLeaderRegistrationCashPaid(
      leader._id.toString()
    );

    const recipients = [
      auth.user.email,
      leader.email,
      process.env.SMTP_USER,
    ].filter(Boolean);

    const uniqueRecipients = [...new Set(recipients)].join(",");
    const emailBody = cashPaymentConfirmationEmail({
      candidateName: auth.user.name,
      candidateEmail: auth.user.email,
      leaderName: leader.name,
      leaderEmail: leader.email,
      leaderPhone: leader.phone,
      amount: updatedLeader.registrationPaymentAmount || 100,
    });

    const mailResult = uniqueRecipients
      ? await sendMail(
          uniqueRecipients,
          "Cash payment confirmed for leader registration",
          emailBody
        )
      : { success: true };

    return successResponse(
      200,
      mailResult.success
        ? "Cash payment recorded successfully"
        : "Cash payment recorded, but email could not be sent",
      {
        user: toManagedUserPayload(updatedLeader),
      }
    );
  } catch (error) {
    return errorResponse(
      500,
      error?.message || "Unable to record cash payment"
    );
  }
}
