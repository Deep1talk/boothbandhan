import { createCsvContent, createCsvResponse } from "@/lib/csv";
import { errorResponse } from "@/lib/helper";
import { parseManagedUserListParams } from "@/lib/managedUserFilters";
import { requireRequestUser } from "@/lib/server/requestUser";
import { exportCandidatesForAdmin } from "@/lib/users/queries";

const headers = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "district", label: "District" },
  { key: "vidhansabha", label: "Vidhansabha" },
  { key: "block", label: "Block" },
  { key: "panchayat", label: "Panchayat" },
  { key: "leadersCount", label: "Linked Leaders" },
  { key: "isEmailVerified", label: "Email Verified" },
  { key: "isLocked", label: "Locked" },
  { key: "createdAt", label: "Created At" },
];

export async function GET(req) {
  try {
    const auth = await requireRequestUser(req, ["Admin"]);

    if (!auth.ok) {
      return auth.response;
    }

    const { filters } = parseManagedUserListParams(req.nextUrl.searchParams);
    const candidates = await exportCandidatesForAdmin(auth.user.id, filters);
    const csv = createCsvContent(
      headers,
      candidates.map((candidate) => ({
        ...candidate,
        isEmailVerified: candidate.isEmailVerified ? "Yes" : "No",
        isLocked: candidate.isLocked ? "Yes" : "No",
        createdAt: candidate.createdAt
          ? new Date(candidate.createdAt).toISOString()
          : "",
      }))
    );

    return createCsvResponse("candidates.csv", csv);
  } catch (error) {
    return errorResponse(500, error?.message || "Unable to export candidates");
  }
}
