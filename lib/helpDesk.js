import { connectDB } from "@/lib/connectDB";
import { helpDeskProblemSchema } from "@/lib/helpDeskValidation";
import HelpDeskProblemModel from "@/models/helpDeskProblemSchema";

function normalizeOptionalString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function toHelpDeskProblemPayload(problem) {
  if (!problem) {
    return null;
  }

  return {
    id: problem._id.toString(),
    leaderId:
      typeof problem.leaderId === "object" && problem.leaderId?._id
        ? problem.leaderId._id.toString()
        : problem.leaderId?.toString?.() ?? "",
    constituency: problem.constituency || "",
    block: problem.block || "",
    panchayat: problem.panchayat || "",
    wardNumber: problem.wardNumber || "",
    wardInchargeName: problem.wardInchargeName || "",
    wardInchargePhone: problem.wardInchargePhone || "",
    headOfFamilyName: problem.headOfFamilyName || "",
    fatherOrSpouseName: problem.fatherOrSpouseName || "",
    age: problem.age ?? null,
    gender: problem.gender || "",
    casteCategory: problem.casteCategory || "",
    mobileNumber: problem.mobileNumber || "",
    whatsappNumber: problem.whatsappNumber || "",
    localAddress: problem.localAddress || "",
    totalFamilyMembers: problem.totalFamilyMembers ?? null,
    familyMembers: Array.isArray(problem.familyMembers)
      ? problem.familyMembers
          .map((member) => ({
            name: member.name || "",
            relation: member.relation || "",
            age: member.age ?? null,
            gender: member.gender || "",
            mobileNumber: member.mobileNumber || "",
            educationOrOccupation: member.educationOrOccupation || "",
          }))
          .filter((member) =>
            Object.values(member).some((value) => value !== "" && value !== null)
          )
      : [],
    issueCategories: Array.isArray(problem.issueCategories) ? problem.issueCategories : [],
    issueDetails: problem.issueDetails || "",
    verifierComment: problem.verifierComment || "",
    wantsToJoinOrganization:
      typeof problem.wantsToJoinOrganization === "boolean"
        ? problem.wantsToJoinOrganization
        : null,
    status: problem.status || "new",
    createdAt: problem.createdAt,
    updatedAt: problem.updatedAt,
  };
}

export async function createHelpDeskProblem(leaderId, payload) {
  await connectDB();

  const parsed = helpDeskProblemSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      message: "Invalid help desk problem data",
      error: parsed.error.flatten(),
    };
  }

  const normalizedFamilyMembers = (parsed.data.familyMembers || []).filter((member) =>
    Object.values(member).some((value) => value !== "" && value !== undefined)
  );

  const problem = await HelpDeskProblemModel.create({
    leaderId,
    ...parsed.data,
    constituency: normalizeOptionalString(parsed.data.constituency),
    block: normalizeOptionalString(parsed.data.block),
    panchayat: normalizeOptionalString(parsed.data.panchayat),
    wardNumber: normalizeOptionalString(parsed.data.wardNumber),
    wardInchargeName: normalizeOptionalString(parsed.data.wardInchargeName),
    wardInchargePhone: normalizeOptionalString(parsed.data.wardInchargePhone),
    fatherOrSpouseName: normalizeOptionalString(parsed.data.fatherOrSpouseName),
    gender: normalizeOptionalString(parsed.data.gender),
    casteCategory: normalizeOptionalString(parsed.data.casteCategory),
    whatsappNumber: normalizeOptionalString(parsed.data.whatsappNumber),
    localAddress: normalizeOptionalString(parsed.data.localAddress),
    verifierComment: normalizeOptionalString(parsed.data.verifierComment),
    familyMembers: normalizedFamilyMembers,
  });

  return {
    ok: true,
    problem: toHelpDeskProblemPayload(problem),
  };
}

export async function getLeaderHelpDeskProblems(leaderId) {
  await connectDB();

  const problems = await HelpDeskProblemModel.find({ leaderId })
    .sort({ createdAt: -1 })
    .lean();

  return problems.map(toHelpDeskProblemPayload);
}
