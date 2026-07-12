import { createCsvContent, createCsvResponse } from "@/lib/csv";
import { errorResponse } from "@/lib/helper";
import { parseManagedUserListParams } from "@/lib/managedUserFilters";
import { requireRequestUser } from "@/lib/server/requestUser";
import { exportLeadersForAdmin, exportLeadersForCandidate } from "@/lib/users/queries";

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
  { key: "leaderSource", label: "Source" },
  { key: "parentName", label: "Managed By" },
  { key: "registrationPaymentStatus", label: "Payment Status" },
  { key: "isEmailVerified", label: "Email Verified" },
  { key: "isLocked", label: "Locked" },
  { key: "createdAt", label: "Created At" },
];

export async function GET(req) {
  try {
    const auth = await requireRequestUser(req);

    if (!auth.ok) {
      return auth.response;
    }

    const { filters } = parseManagedUserListParams(req.nextUrl.searchParams);
    let leaders = [];
    let filename = "leaders.csv";

    if (auth.user.role === "Candidate") {
      leaders = await exportLeadersForCandidate(auth.user.id, filters);
    } else if (auth.user.role === "Admin") {
      leaders = await exportLeadersForAdmin(auth.user.id, filters);
      filename = "admin-leaders.csv";
    } else {
      return errorResponse(403, "Only candidates and admins can export leaders");
    }

    const csv = createCsvContent(
      headers,
      leaders.map((leader) => ({
        ...leader,
        leaderSource: leader.leaderSource === "direct" ? "Direct" : "Field Associate",
        parentName:
          leader.leaderSource === "direct"
            ? "Direct registration"
            : leader.parentName || "",
        isEmailVerified: leader.isEmailVerified ? "Yes" : "No",
        isLocked: leader.isLocked ? "Yes" : "No",
        createdAt: leader.createdAt ? new Date(leader.createdAt).toISOString() : "",
      }))
    );

    return createCsvResponse(filename, csv);
  } catch (error) {
    return errorResponse(500, error?.message || "Unable to export leaders");
  }
}
