import { connectDB } from "@/lib/connectDB";
import { helpDeskProblemSchema } from "@/lib/helpDeskValidation";
import HelpDeskProblemModel from "@/models/helpDeskProblemSchema";
import UserModel from "@/models/userSchema";

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

export async function getLeaderHelpDeskProblemsPage(
  leaderId,
  { page = 1, pageSize = 20 } = {}
) {
  await connectDB();

  const totalItems = await HelpDeskProblemModel.countDocuments({ leaderId });
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const skip = (safePage - 1) * pageSize;

  const problems = await HelpDeskProblemModel.find({ leaderId })
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  return {
    problems: problems.map(toHelpDeskProblemPayload),
    pagination: buildPagination(
      safePage,
      pageSize,
      totalItems,
      problems.length
    ),
  };
}

function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildDateRange(startDate, endDate) {
  const range = {};

  if (startDate) {
    range.$gte = new Date(`${startDate}T00:00:00+05:30`);
  }

  if (endDate) {
    range.$lte = new Date(`${endDate}T23:59:59.999+05:30`);
  }

  return Object.keys(range).length ? range : null;
}

function buildPagination(page, pageSize, totalItems, itemCount) {
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endIndex = totalItems === 0 ? 0 : startIndex + itemCount - 1;

  return {
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    itemCount,
    startIndex,
    endIndex,
    hasPreviousPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  };
}

function buildLeaderProblemMatch(adminUserId, managedCandidateIds, filters = {}) {
  const conditions = [];
  const searchTerm = filters.search?.trim();
  const blockTerm = filters.block?.trim();

  if (filters.leaderSource === "direct") {
    conditions.push({ "leader.parentId": null });
  } else if (filters.leaderSource === "managed") {
    conditions.push({
      "leader.parentId": { $in: managedCandidateIds },
    });
  } else {
    conditions.push({
      $or: [
        { "leader.parentId": null },
        { "leader.parentId": { $in: managedCandidateIds } },
      ],
    });
  }

  if (searchTerm) {
    const regex = new RegExp(escapeRegex(searchTerm), "i");
    conditions.push({
      $or: [
        { "leader.name": regex },
        { "leader.phone": regex },
        { "leader.email": regex },
        { "leaderParent.name": regex },
        { headOfFamilyName: regex },
        { mobileNumber: regex },
        { localAddress: regex },
        { block: regex },
        { panchayat: regex },
      ],
    });
  }

  if (filters.status) {
    conditions.push({ status: filters.status });
  }

  if (filters.district) {
    conditions.push({ "leader.district": filters.district });
  }

  if (filters.vidhansabha) {
    conditions.push({ "leader.vidhansabha": filters.vidhansabha });
  }

  if (blockTerm) {
    const blockRegex = new RegExp(escapeRegex(blockTerm), "i");
    conditions.push({
      $or: [{ block: blockRegex }, { "leader.block": blockRegex }],
    });
  }

  const createdAtRange = buildDateRange(filters.startDate, filters.endDate);

  if (createdAtRange) {
    conditions.push({ createdAt: createdAtRange });
  }

  return conditions.length ? { $and: conditions } : {};
}

function normalizeLeaderProblem(problem) {
  return {
    ...toHelpDeskProblemPayload(problem),
    leader: problem.leader
      ? {
          id: problem.leader._id.toString(),
          name: problem.leader.name || "",
          email: problem.leader.email || "",
          phone: problem.leader.phone || "",
          district: problem.leader.district || "",
          vidhansabha: problem.leader.vidhansabha || "",
          block: problem.leader.block || "",
          panchayat: problem.leader.panchayat || "",
          ward: problem.leader.ward || "",
          currentParty: problem.leader.currentParty || "",
          politicalPosition: problem.leader.politicalPosition || "",
          parentId: problem.leader.parentId?.toString?.() ?? null,
          leaderSource: problem.leader.parentId ? "candidate" : "direct",
        }
      : null,
    leaderParent: problem.leaderParent
      ? {
          id: problem.leaderParent._id.toString(),
          name: problem.leaderParent.name || "",
        }
      : null,
  };
}

export async function exportAdminLeaderProblems(adminUserId, filters = {}) {
  await connectDB();

  const candidateIds = await UserModel.find({
    role: "Candidate",
    parentId: adminUserId,
  })
    .select("_id")
    .lean();
  const managedCandidateIds = candidateIds.map((candidate) => candidate._id);
  const match = buildLeaderProblemMatch(
    adminUserId,
    managedCandidateIds,
    filters
  );

  const problems = await HelpDeskProblemModel.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "leaderId",
        foreignField: "_id",
        as: "leader",
      },
    },
    {
      $unwind: "$leader",
    },
    {
      $lookup: {
        from: "users",
        localField: "leader.parentId",
        foreignField: "_id",
        as: "leaderParent",
      },
    },
    {
      $unwind: {
        path: "$leaderParent",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: match,
    },
    {
      $sort: {
        createdAt: -1,
        _id: -1,
      },
    },
  ]);

  return problems.map(normalizeLeaderProblem);
}

export async function getAdminLeaderProblems(adminUserId, options = {}) {
  await connectDB();

  const page = options.page || 1;
  const pageSize = options.pageSize || 20;
  const candidateIds = await UserModel.find({
    role: "Candidate",
    parentId: adminUserId,
  })
    .select("_id")
    .lean();
  const managedCandidateIds = candidateIds.map((candidate) => candidate._id);
  const match = buildLeaderProblemMatch(
    adminUserId,
    managedCandidateIds,
    options.filters
  );

  const totalItemsResult = await HelpDeskProblemModel.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "leaderId",
        foreignField: "_id",
        as: "leader",
      },
    },
    {
      $unwind: "$leader",
    },
    {
      $lookup: {
        from: "users",
        localField: "leader.parentId",
        foreignField: "_id",
        as: "leaderParent",
      },
    },
    {
      $unwind: {
        path: "$leaderParent",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: match,
    },
    {
      $count: "totalItems",
    },
  ]);

  const totalItems = totalItemsResult[0]?.totalItems ?? 0;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const skip = (safePage - 1) * pageSize;

  const problems = await HelpDeskProblemModel.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "leaderId",
        foreignField: "_id",
        as: "leader",
      },
    },
    {
      $unwind: "$leader",
    },
    {
      $lookup: {
        from: "users",
        localField: "leader.parentId",
        foreignField: "_id",
        as: "leaderParent",
      },
    },
    {
      $unwind: {
        path: "$leaderParent",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: match,
    },
    {
      $sort: {
        createdAt: -1,
        _id: -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: pageSize,
    },
  ]);

  const counts = await HelpDeskProblemModel.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "leaderId",
        foreignField: "_id",
        as: "leader",
      },
    },
    {
      $unwind: "$leader",
    },
    {
      $lookup: {
        from: "users",
        localField: "leader.parentId",
        foreignField: "_id",
        as: "leaderParent",
      },
    },
    {
      $unwind: {
        path: "$leaderParent",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: match,
    },
    {
      $group: {
        _id: null,
        problems: { $sum: 1 },
        newProblems: {
          $sum: {
            $cond: [{ $eq: ["$status", "new"] }, 1, 0],
          },
        },
        inReviewProblems: {
          $sum: {
            $cond: [{ $eq: ["$status", "in_review"] }, 1, 0],
          },
        },
        resolvedProblems: {
          $sum: {
            $cond: [{ $eq: ["$status", "resolved"] }, 1, 0],
          },
        },
        directLeaderProblems: {
          $sum: {
            $cond: [{ $eq: ["$leader.parentId", null] }, 1, 0],
          },
        },
      },
    },
  ]);

  const countSummary = counts[0] || {
    problems: 0,
    newProblems: 0,
    inReviewProblems: 0,
    resolvedProblems: 0,
    directLeaderProblems: 0,
  };

  return {
    problems: problems.map(normalizeLeaderProblem),
    pagination: buildPagination(
      safePage,
      pageSize,
      totalItems,
      problems.length
    ),
    counts: {
      problems: countSummary.problems,
      newProblems: countSummary.newProblems,
      inReviewProblems: countSummary.inReviewProblems,
      resolvedProblems: countSummary.resolvedProblems,
      directLeaderProblems: countSummary.directLeaderProblems,
      managedLeaderProblems:
        countSummary.problems - countSummary.directLeaderProblems,
    },
  };
}
