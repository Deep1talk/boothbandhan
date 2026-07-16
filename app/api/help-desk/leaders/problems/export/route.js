import { createCsvContent, createCsvResponse } from "@/lib/csv";
import { exportAdminLeaderProblems } from "@/lib/helpDesk";
import { errorResponse } from "@/lib/helper";
import { HELP_DESK_ISSUE_OPTIONS } from "@/lib/helpDeskOptions";
import { parseManagedUserListParams } from "@/lib/managedUserFilters";
import { requireRequestUser } from "@/lib/server/requestUser";

const headers = [
  { key: "leaderName", label: "Leader Name" },
  { key: "leaderPhone", label: "Leader Phone" },
  { key: "leaderEmail", label: "Leader Email" },
  { key: "leaderSource", label: "Leader Type" },
  { key: "managedBy", label: "Managed By" },
  { key: "leaderDistrict", label: "Leader District" },
  { key: "leaderVidhansabha", label: "Leader Vidhansabha" },
  { key: "leaderBlock", label: "Leader Block" },
  { key: "headOfFamilyName", label: "Head of Family" },
  { key: "mobileNumber", label: "Mobile Number" },
  { key: "whatsappNumber", label: "WhatsApp Number" },
  { key: "fatherOrSpouseName", label: "Father or Spouse Name" },
  { key: "age", label: "Age" },
  { key: "gender", label: "Gender" },
  { key: "casteCategory", label: "Caste Category" },
  { key: "constituency", label: "Constituency" },
  { key: "block", label: "Problem Block" },
  { key: "panchayat", label: "Problem Panchayat" },
  { key: "wardNumber", label: "Ward Number" },
  { key: "wardInchargeName", label: "Ward Incharge Name" },
  { key: "wardInchargePhone", label: "Ward Incharge Phone" },
  { key: "localAddress", label: "Local Address" },
  { key: "totalFamilyMembers", label: "Total Family Members" },
  { key: "issueCategories", label: "Issue Categories" },
  { key: "issueDetails", label: "Issue Details" },
  { key: "verifierComment", label: "Verifier Comment" },
  { key: "wantsToJoinOrganization", label: "Wants To Join Organization" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
];

export async function GET(req) {
  try {
    const auth = await requireRequestUser(req, ["Admin"]);

    if (!auth.ok) {
      return auth.response;
    }

    const { filters } = parseManagedUserListParams(req.nextUrl.searchParams);
    const problems = await exportAdminLeaderProblems(auth.user.id, filters);
    const issueLabelMap = HELP_DESK_ISSUE_OPTIONS.reduce((acc, option) => {
      acc[option.value] = option.label;
      return acc;
    }, {});
    const csv = createCsvContent(
      headers,
      problems.map((problem) => ({
        ...problem,
        leaderName: problem.leader?.name || "",
        leaderPhone: problem.leader?.phone || "",
        leaderEmail: problem.leader?.email || "",
        leaderSource:
          problem.leader?.leaderSource === "direct" ? "Direct" : "Managed",
        managedBy: problem.leaderParent?.name || "Direct registration",
        leaderDistrict: problem.leader?.district || "",
        leaderVidhansabha: problem.leader?.vidhansabha || "",
        leaderBlock: problem.leader?.block || "",
        age: problem.age ?? "",
        totalFamilyMembers: problem.totalFamilyMembers ?? "",
        issueCategories: (problem.issueCategories || [])
          .map((category) => issueLabelMap[category] || category)
          .join(" | "),
        wantsToJoinOrganization:
          typeof problem.wantsToJoinOrganization === "boolean"
            ? problem.wantsToJoinOrganization
              ? "Yes"
              : "No"
            : "",
        status: (problem.status || "new").replaceAll("_", " "),
        createdAt: problem.createdAt
          ? new Date(problem.createdAt).toISOString()
          : "",
        updatedAt: problem.updatedAt
          ? new Date(problem.updatedAt).toISOString()
          : "",
      }))
    );

    return createCsvResponse("admin-leader-problems.csv", csv);
  } catch (error) {
    return errorResponse(
      500,
      error?.message || "Unable to export leader problems"
    );
  }
}
