import { createCsvContent, createCsvResponse } from "@/lib/csv";
import { getLeaderHelpDeskProblems } from "@/lib/helpDesk";
import { errorResponse } from "@/lib/helper";
import { HELP_DESK_ISSUE_OPTIONS } from "@/lib/helpDeskOptions";
import { requireRequestUser } from "@/lib/server/requestUser";
import { findAdminManagedUser } from "@/lib/users/queries";

const headers = [
  { key: "leaderName", label: "Leader Name" },
  { key: "headOfFamilyName", label: "Head of Family" },
  { key: "mobileNumber", label: "Mobile Number" },
  { key: "whatsappNumber", label: "WhatsApp Number" },
  { key: "fatherOrSpouseName", label: "Father or Spouse Name" },
  { key: "age", label: "Age" },
  { key: "gender", label: "Gender" },
  { key: "casteCategory", label: "Caste Category" },
  { key: "constituency", label: "Constituency" },
  { key: "block", label: "Block" },
  { key: "panchayat", label: "Panchayat" },
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

function toSlug(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "leader";
}

export async function GET(req, { params }) {
  try {
    const auth = await requireRequestUser(req, ["Admin"]);

    if (!auth.ok) {
      return auth.response;
    }

    const { leaderId } = await params;
    const managedLeader = await findAdminManagedUser(auth.user.id, leaderId);

    if (!managedLeader || managedLeader.role !== "Leader") {
      return errorResponse(404, "Leader not found");
    }

    const problems = await getLeaderHelpDeskProblems(leaderId);
    const issueLabelMap = HELP_DESK_ISSUE_OPTIONS.reduce((acc, option) => {
      acc[option.value] = option.label;
      return acc;
    }, {});
    const csv = createCsvContent(
      headers,
      problems.map((problem) => ({
        ...problem,
        leaderName: managedLeader.name || "",
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

    return createCsvResponse(
      `${toSlug(managedLeader.name)}-help-desk-problems.csv`,
      csv
    );
  } catch (error) {
    return errorResponse(
      500,
      error?.message || "Unable to export leader problems"
    );
  }
}
