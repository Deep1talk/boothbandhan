import { createCsvContent, createCsvResponse } from "@/lib/csv";
import { errorResponse } from "@/lib/helper";
import { parseManagedUserListParams } from "@/lib/managedUserFilters";
import { requireRequestUser } from "@/lib/server/requestUser";
import { exportLeadersForCandidate } from "@/lib/users/queries";

const headers = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "district", label: "District" },
  { key: "vidhansabha", label: "Vidhansabha" },
  { key: "block", label: "Block" },
  { key: "panchayat", label: "Panchayat" },
  { key: "ward", label: "Ward" },
  { key: "activeWorkerCount", label: "Workers" },
  { key: "totalVoters", label: "Voters" },
  { key: "registrationPaymentStatus", label: "Payment Status" },
  { key: "isEmailVerified", label: "Email Verified" },
  { key: "isLocked", label: "Locked" },
  { key: "createdAt", label: "Created At" },
];

export async function GET(req) {
  try {
    const auth = await requireRequestUser(req, ["Candidate"]);

    if (!auth.ok) {
      return auth.response;
    }

    const { filters } = parseManagedUserListParams(req.nextUrl.searchParams);
    const leaders = await exportLeadersForCandidate(auth.user.id, filters);
    const csv = createCsvContent(
      headers,
      leaders.map((leader) => ({
        ...leader,
        isEmailVerified: leader.isEmailVerified ? "Yes" : "No",
        isLocked: leader.isLocked ? "Yes" : "No",
        createdAt: leader.createdAt ? new Date(leader.createdAt).toISOString() : "",
      }))
    );

    return createCsvResponse("leaders.csv", csv);
  } catch (error) {
    return errorResponse(500, error?.message || "Unable to export leaders");
  }
}
